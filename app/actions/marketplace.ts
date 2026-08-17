"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, players, teamPlayers } from "@/db/schema";
import { getAuthSession, getCurrentTeam } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

export interface BuyPlayerResult {
  success: boolean;
  newBalance?: number;
  playerName?: string;
  error?: string;
}

export async function buyPlayerAction(playerId: string): Promise<BuyPlayerResult> {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized session. Please sign in." };
    }

    const team = await getCurrentTeam();
    if (!team) {
      return { success: false, error: "No active team found for this user." };
    }

    // Sequential operations (neon-http has no transaction support;
    // idempotency is guarded by the existingOwned check below)

    // 1. Check current owned players count (Max squad size: 7)
    const ownedRecords = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teamPlayers)
      .where(eq(teamPlayers.teamId, team.id));

    const ownedCount = Number(ownedRecords[0]?.count ?? 0);
    if (ownedCount >= 7) {
      return { success: false, error: "Squad complete! You can only buy and own a maximum of 7 players." };
    }

    // 2. Fetch player record from DB
    const [playerRecord] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (!playerRecord) {
      return { success: false, error: "Player not found in catalog." };
    }

    // 3. Fetch fresh team balance
    const [freshTeam] = await db
      .select({ balance: teams.balance })
      .from(teams)
      .where(eq(teams.id, team.id))
      .limit(1);

    if (!freshTeam) {
      return { success: false, error: "Team record not found." };
    }

    // 4. Check if team already owns this player
    const [existingOwned] = await db
      .select()
      .from(teamPlayers)
      .where(and(eq(teamPlayers.teamId, team.id), eq(teamPlayers.playerId, playerId)))
      .limit(1);

    if (existingOwned) {
      return { success: false, error: `${playerRecord.playerName} is already in your squad!` };
    }

    // 5. Check sufficient balance
    if (freshTeam.balance < playerRecord.price) {
      return {
        success: false,
        error: `Insufficient balance ($${freshTeam.balance}). ${playerRecord.playerName} costs $${playerRecord.price}. Solve more questions to earn credits!`,
      };
    }

    const updatedBalance = freshTeam.balance - playerRecord.price;

    // 6. Deduct balance from team
    await db
      .update(teams)
      .set({ balance: updatedBalance, updatedAt: new Date() })
      .where(eq(teams.id, team.id));

    // 7. Record player purchase in squad
    await db.insert(teamPlayers).values({
      teamId: team.id,
      playerId: playerRecord.id,
    });

    const result = {
      success: true,
      newBalance: updatedBalance,
      playerName: playerRecord.playerName,
    };

    if (result.success) {
      revalidatePath("/marketplace");
      revalidatePath("/dashboard");
    }

    return result;
  } catch (error: any) {
    console.error("Error in buyPlayerAction:", error);
    return { success: false, error: error?.message || "Failed to complete player purchase." };
  }
}
