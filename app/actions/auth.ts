"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, teamTiers, tiers } from "@/db/schema";
import { getAuthSession, createAuthSession, destroyAuthSession } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";

export async function signInAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  let userId = formData.get("userId")?.toString().trim();

  if (!userId) {
    if (email) {
      userId = `user_${crypto.createHash("sha256").update(email).digest("hex").substring(0, 16)}`;
    } else {
      userId = `user_${crypto.randomUUID()}`;
    }
  }

  await createAuthSession(userId, email || undefined);
  revalidatePath("/");
  redirect("/");
}

export async function signOutAction() {
  await destroyAuthSession();
  revalidatePath("/");
  redirect("/");
}

export async function completeOnboarding(formData: FormData) {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return { error: "Unauthorized: Must be authenticated to complete onboarding." };
    }

    const teamName = formData.get("teamName")?.toString().trim();
    const teamLeaderName = formData.get("teamLeaderName")?.toString().trim();

    if (!teamName || !teamLeaderName) {
      return { error: "Team Name and Team Leader Name are required." };
    }

    // Prevent duplicate team creation for the same authUserId
    const existingTeam = await db
      .select()
      .from(teams)
      .where(eq(teams.authUserId, session.userId))
      .limit(1);

    if (existingTeam.length > 0) {
      redirect("/dashboard");
    }

    // Insert new team
    const [newTeam] = await db
      .insert(teams)
      .values({
        authUserId: session.userId,
        teamName,
        teamLeaderName,
        balance: 0,
      })
      .returning();

    // Fetch existing tiers sorted by tierNumber
    const allTiers = await db
      .select()
      .from(tiers)
      .orderBy(asc(tiers.tierNumber));

    if (allTiers.length > 0) {
      const teamTierValues = allTiers.map((t) => {
        const isTier1 = t.tierNumber === 1;
        return {
          teamId: newTeam.id,
          tierId: t.id,
          status: isTier1 ? "UNLOCKED" : "LOCKED",
          retriesRemaining: 2,
        };
      });

      await db.insert(teamTiers).values(teamTierValues);
    }
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error in completeOnboarding:", error);
    return { error: "Failed to create team. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

