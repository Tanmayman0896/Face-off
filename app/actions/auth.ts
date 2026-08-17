"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, teamTiers, tiers } from "@/db/schema";
import { getAuthSession, createAuthSession, destroyAuthSession } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  try {
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

    // Check if team already exists for this user
    const existingTeam = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.authUserId, userId))
      .limit(1);

    const redirectUrl = existingTeam.length > 0 ? "/dashboard" : "/";

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/marketplace");

    return {
      success: true,
      redirectUrl,
    };
  } catch (error: any) {
    console.error("Error in signInAction:", error);
    return {
      success: false,
      error: error?.message || "Authentication failed. Please try again.",
    };
  }
}

export async function signOutAction(): Promise<AuthActionResult> {
  try {
    await destroyAuthSession();
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/marketplace");

    return {
      success: true,
      redirectUrl: "/",
    };
  } catch (error: any) {
    console.error("Error in signOutAction:", error);
    return {
      success: false,
      error: error?.message || "Sign out failed. Please try again.",
    };
  }
}

export async function completeOnboarding(formData: FormData): Promise<AuthActionResult> {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized: Must be authenticated to complete onboarding." };
    }

    const teamName = formData.get("teamName")?.toString().trim();

    if (!teamName) {
      return { success: false, error: "Team Name is required." };
    }

    // Prevent duplicate team creation for the same authUserId
    const existingTeam = await db
      .select()
      .from(teams)
      .where(eq(teams.authUserId, session.userId))
      .limit(1);

    if (existingTeam.length > 0) {
      revalidatePath("/");
      revalidatePath("/dashboard");
      return { success: true, redirectUrl: "/dashboard" };
    }

    // Insert new team
    const [newTeam] = await db
      .insert(teams)
      .values({
        authUserId: session.userId,
        teamName,
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

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/marketplace");

    return {
      success: true,
      redirectUrl: "/dashboard",
    };
  } catch (error: any) {
    console.error("Error in completeOnboarding:", error);
    return {
      success: false,
      error: error?.message || "Failed to create team. Please try again.",
    };
  }
}

