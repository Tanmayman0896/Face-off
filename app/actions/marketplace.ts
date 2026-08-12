"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, players, teamPlayers } from "@/db/schema";
import { getAuthSession, getCurrentTeam } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

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

    // Perform atomic database transaction
    const result = await db.transaction(async (tx) => {
      // 1. Fetch player record from DB
      const [playerRecord] = await tx
        .select()
        .from(players)
        .where(eq(players.id, playerId))
        .limit(1);

      if (!playerRecord) {
        return { success: false, error: "Player not found in catalog." };
      }

      // 2. Fetch fresh team balance
      const [freshTeam] = await tx
        .select({ balance: teams.balance })
        .from(teams)
        .where(eq(teams.id, team.id))
        .limit(1);

      if (!freshTeam) {
        return { success: false, error: "Team record not found." };
      }

      // 3. Check if team already owns this player
      const [existingOwned] = await tx
        .select()
        .from(teamPlayers)
        .where(and(eq(teamPlayers.teamId, team.id), eq(teamPlayers.playerId, playerId)))
        .limit(1);

      if (existingOwned) {
        return { success: false, error: `${playerRecord.playerName} is already in your squad!` };
      }

      // 4. Check sufficient balance
      if (freshTeam.balance < playerRecord.price) {
        return {
          success: false,
          error: `Insufficient balance ($${freshTeam.balance}). ${playerRecord.playerName} costs $${playerRecord.price}. Solve more questions to earn credits!`,
        };
      }

      const updatedBalance = freshTeam.balance - playerRecord.price;

      // 5. Deduct balance from team
      await tx
        .update(teams)
        .set({ balance: updatedBalance, updatedAt: new Date() })
        .where(eq(teams.id, team.id));

      // 6. Record player purchase in squad
      await tx.insert(teamPlayers).values({
        teamId: team.id,
        playerId: playerRecord.id,
      });

      return {
        success: true,
        newBalance: updatedBalance,
        playerName: playerRecord.playerName,
      };
    });

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
