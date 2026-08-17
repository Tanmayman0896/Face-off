"use server";

import { db } from "@/db";
import { teams, teamTiers, teamQuestionRewards, teamPlayers, questions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getAuthSession, getCurrentTeam } from "@/lib/auth";
import { type PendingOperation } from "@/lib/offlineStore";

interface SyncResult {
  id: string;
  success: boolean;
  error?: string;
}

export async function replaySyncQueue(ops: PendingOperation[]): Promise<SyncResult[]> {
  const session = await getAuthSession();
  if (!session?.userId) return ops.map((op) => ({ id: op.id, success: false, error: "Unauthorized" }));

  const team = await getCurrentTeam();
  if (!team) return ops.map((op) => ({ id: op.id, success: false, error: "No team" }));

  const results: SyncResult[] = [];

  for (const op of ops) {
    try {
      if (op.type === "SUBMIT_ANSWER") {
        const { questionId, answer, isCorrect, tierId } = op.payload as {
          questionId: string;
          answer: string;
          isCorrect: boolean;
          tierId: string;
        };

        // Record the attempt
        await db.insert(teamQuestionRewards).values({
          teamId: team.id,
          questionId,
          rewardAmount: 0, // will recalculate below
        }).onConflictDoNothing();

        if (isCorrect) {
          const [qRecord] = await db
            .select({ reward: questions.reward })
            .from(questions)
            .where(eq(questions.id, questionId))
            .limit(1);

          if (qRecord) {
            // Check not already rewarded
            const [existing] = await db
              .select()
              .from(teamQuestionRewards)
              .where(and(eq(teamQuestionRewards.teamId, team.id), eq(teamQuestionRewards.questionId, questionId)))
              .limit(1);

            if (!existing) {
              await db.insert(teamQuestionRewards).values({
                teamId: team.id,
                questionId,
                rewardAmount: qRecord.reward,
              });
              await db
                .update(teams)
                .set({ balance: sql`${teams.balance} + ${qRecord.reward}`, updatedAt: new Date() })
                .where(eq(teams.id, team.id));
            }

            // Mark tier completed
            await db
              .update(teamTiers)
              .set({ status: "COMPLETED", completedAt: new Date(), updatedAt: new Date() })
              .where(and(eq(teamTiers.teamId, team.id), eq(teamTiers.tierId, tierId)));
          }
        } else {
          // Decrement retries
          await db
            .update(teamTiers)
            .set({
              retriesRemaining: sql`GREATEST(0, ${teamTiers.retriesRemaining} - 1)`,
              updatedAt: new Date(),
            })
            .where(and(eq(teamTiers.teamId, team.id), eq(teamTiers.tierId, tierId)));
        }
        results.push({ id: op.id, success: true });
      } else if (op.type === "BUY_PLAYER") {
        const { playerId, price } = op.payload as { playerId: string; price: number };

        const [existing] = await db
          .select()
          .from(teamPlayers)
          .where(and(eq(teamPlayers.teamId, team.id), eq(teamPlayers.playerId, playerId)))
          .limit(1);

        if (!existing) {
          await db
            .update(teams)
            .set({ balance: sql`GREATEST(0, ${teams.balance} - ${price})`, updatedAt: new Date() })
            .where(eq(teams.id, team.id));

          await db.insert(teamPlayers).values({ teamId: team.id, playerId });
        }
        results.push({ id: op.id, success: true });
      } else {
        results.push({ id: op.id, success: false, error: "Unknown op type" });
      }
    } catch (e: any) {
      results.push({ id: op.id, success: false, error: e?.message });
    }
  }

  return results;
}
