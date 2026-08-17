"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, tiers, questions, teamTiers, questionAttempts, teamQuestionRewards } from "@/db/schema";
import { getAuthSession, getCurrentTeam } from "@/lib/auth";
import { eq, and, sql, inArray } from "drizzle-orm";

export interface SubmitAnswerParams {
  questionId: string;
  answer: string;
}

export interface SubmitAnswerResult {
  success: boolean;
  isCorrect?: boolean;
  reward?: number;
  tierCompleted?: boolean;
  nextTierId?: string | null;
  nextTierUnlocked?: boolean;
  retriesRemaining?: number;
  tierFailed?: boolean;
  error?: string;
}

function validateAnswer(submitted: string, correct: string): boolean {
  const normSub = (submitted || "").trim().toLowerCase();
  const normCorr = (correct || "").trim().toLowerCase();

  if (!normSub) return false;
  if (normSub === normCorr) return true;

  // Handle "(or ...)" e.g. "1/6 (or 16.67%)" or "75% (or 3/4)"
  if (normCorr.includes("(or ")) {
    const parts = normCorr
      .split(/\s*\(or\s*|\)\s*/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.some((p) => normSub === p || normSub.replace(/[%]/g, "") === p.replace(/[%]/g, ""))) {
      return true;
    }
  }

  // Handle unit suffix removal (e.g. "6 seconds" -> "6", "12 years old" -> "12")
  const commonUnitsRegex = /\b(seconds|matches|degrees|degree|days|times|years old|years|km\/h|kmh|minutes|cats|cents|place|cubes|students|weighings|rungs)\b/gi;
  const cleanCorr = normCorr.replace(commonUnitsRegex, "").trim();
  const cleanSub = normSub.replace(commonUnitsRegex, "").trim();

  if (cleanSub && cleanSub === cleanCorr) {
    return true;
  }

  // Handle list formatting e.g. "1, 2, and 3" vs "1, 2, 3" vs "1,2,3"
  const normalizeList = (str: string) =>
    str.replace(/\band\b/g, "").replace(/[^a-z0-9]/gi, " ").replace(/\s+/g, " ").trim();
  if (normalizeList(normSub) === normalizeList(normCorr)) {
    return true;
  }

  return false;
}

export async function submitAnswer({
  questionId,
  answer,
}: SubmitAnswerParams): Promise<SubmitAnswerResult> {
  try {
    // 1. Authenticate user session & team
    const session = await getAuthSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized session. Please sign in." };
    }

    const team = await getCurrentTeam();
    if (!team) {
      return { success: false, error: "No active team found for this user." };
    }

    // 2. Fetch question record from DB
    const [questionRecord] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!questionRecord) {
      return { success: false, error: "Question not found." };
    }

    // 3. Fetch team_tiers record
    const [teamTierRecord] = await db
      .select()
      .from(teamTiers)
      .where(
        and(
          eq(teamTiers.teamId, team.id),
          eq(teamTiers.tierId, questionRecord.tierId)
        )
      )
      .limit(1);

    if (!teamTierRecord) {
      return { success: false, error: "Tier record not found for team." };
    }

    if (
      teamTierRecord.status === "LOCKED" ||
      teamTierRecord.status === "FAILED" ||
      (teamTierRecord.status !== "COMPLETED" && teamTierRecord.retriesRemaining <= 0)
    ) {
      return {
        success: false,
        error: "This tier is locked or failed. You cannot submit answers.",
        tierFailed: true,
      };
    }

    // Double-guard: For Tier > 1, verify previous tier is COMPLETED
    const [currentTierRecord] = await db
      .select({ tierNumber: tiers.tierNumber })
      .from(tiers)
      .where(eq(tiers.id, questionRecord.tierId))
      .limit(1);

    if (currentTierRecord && currentTierRecord.tierNumber > 1) {
      const [prevTier] = await db
        .select()
        .from(tiers)
        .where(eq(tiers.tierNumber, currentTierRecord.tierNumber - 1))
        .limit(1);

      if (prevTier) {
        const [prevTeamTier] = await db
          .select()
          .from(teamTiers)
          .where(and(eq(teamTiers.teamId, team.id), eq(teamTiers.tierId, prevTier.id)))
          .limit(1);

        if (!prevTeamTier || (prevTeamTier.status !== "COMPLETED" && prevTeamTier.status !== "FAILED")) {
          return {
            success: false,
            error: "Tier access denied. Complete or attempt previous tier first.",
          };
        }
      }
    }

    // 4. Validate answer (Flexible case-insensitive & unit-tolerant)
    const isCorrect = validateAnswer(answer, questionRecord.answer);

    // 5. Execute DB operations sequentially (neon-http is stateless, no transactions needed —
    //    idempotency is guaranteed by the unique constraint on teamQuestionRewards)

    // Record attempt
    await db.insert(questionAttempts).values({
      teamId: team.id,
      questionId: questionRecord.id,
      tierId: questionRecord.tierId,
      submittedAnswer: answer.trim(),
      isCorrect,
    });

    let result: SubmitAnswerResult;

    if (isCorrect) {
      // Check if reward already granted
      const [existingReward] = await db
        .select()
        .from(teamQuestionRewards)
        .where(
          and(
            eq(teamQuestionRewards.teamId, team.id),
            eq(teamQuestionRewards.questionId, questionRecord.id)
          )
        )
        .limit(1);

      let grantedReward = 0;
      if (!existingReward) {
        await db.insert(teamQuestionRewards).values({
          teamId: team.id,
          questionId: questionRecord.id,
          rewardAmount: questionRecord.reward,
        });

        await db
          .update(teams)
          .set({
            balance: sql`${teams.balance} + ${questionRecord.reward}`,
            updatedAt: new Date(),
          })
          .where(eq(teams.id, team.id));

        grantedReward = questionRecord.reward;
      }

      // Count total solved questions for this tier
      const tierQuestions = await db
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.tierId, questionRecord.tierId));

      const tierQuestionIds = tierQuestions.map((q) => q.id);
      const solvedRecords = await db
        .select({ count: sql<number>`count(distinct ${teamQuestionRewards.questionId})::int` })
        .from(teamQuestionRewards)
        .where(
          and(
            eq(teamQuestionRewards.teamId, team.id),
            inArray(teamQuestionRewards.questionId, tierQuestionIds)
          )
        );

      const solvedCount = Number(solvedRecords[0]?.count ?? 0);
      let tierCompleted = false;
      let nextTierId: string | null = null;

      if (solvedCount >= 1) {
        tierCompleted = true;

        await db
          .update(teamTiers)
          .set({ status: "COMPLETED", completedAt: new Date(), updatedAt: new Date() })
          .where(eq(teamTiers.id, teamTierRecord.id));

        const [currentTierInfo] = await db
          .select({ tierNumber: tiers.tierNumber })
          .from(tiers)
          .where(eq(tiers.id, questionRecord.tierId))
          .limit(1);

        if (currentTierInfo) {
          const [nextTierRecord] = await db
            .select()
            .from(tiers)
            .where(eq(tiers.tierNumber, currentTierInfo.tierNumber + 1))
            .limit(1);

          if (nextTierRecord) {
            nextTierId = nextTierRecord.id;
            const [nextTeamTier] = await db
              .select()
              .from(teamTiers)
              .where(and(eq(teamTiers.teamId, team.id), eq(teamTiers.tierId, nextTierRecord.id)))
              .limit(1);

            if (nextTeamTier) {
              if (nextTeamTier.status === "LOCKED") {
                await db
                  .update(teamTiers)
                  .set({ status: "UNLOCKED", updatedAt: new Date() })
                  .where(eq(teamTiers.id, nextTeamTier.id));
              }
            } else {
              await db.insert(teamTiers).values({
                teamId: team.id,
                tierId: nextTierRecord.id,
                status: "UNLOCKED",
                retriesRemaining: 2,
              });
            }
          }
        }
      }

      result = {
        success: true,
        isCorrect: true,
        reward: grantedReward,
        tierCompleted,
        nextTierId,
        retriesRemaining: teamTierRecord.retriesRemaining,
      };
    } else {
      // INCORRECT
      const newRetries = Math.max(0, teamTierRecord.retriesRemaining - 1);
      const tierFailed = newRetries === 0;

      await db
        .update(teamTiers)
        .set({
          retriesRemaining: newRetries,
          status: tierFailed ? "FAILED" : teamTierRecord.status,
          updatedAt: new Date(),
        })
        .where(eq(teamTiers.id, teamTierRecord.id));

      let nextTierId: string | null = null;
      let nextTierUnlocked = false;

      if (tierFailed) {
        const [currentTierInfo] = await db
          .select({ tierNumber: tiers.tierNumber })
          .from(tiers)
          .where(eq(tiers.id, questionRecord.tierId))
          .limit(1);

        if (currentTierInfo) {
          const [nextTierRecord] = await db
            .select()
            .from(tiers)
            .where(eq(tiers.tierNumber, currentTierInfo.tierNumber + 1))
            .limit(1);

          if (nextTierRecord) {
            nextTierId = nextTierRecord.id;
            nextTierUnlocked = true;

            const [nextTeamTier] = await db
              .select()
              .from(teamTiers)
              .where(and(eq(teamTiers.teamId, team.id), eq(teamTiers.tierId, nextTierRecord.id)))
              .limit(1);

            if (nextTeamTier) {
              if (nextTeamTier.status === "LOCKED") {
                await db
                  .update(teamTiers)
                  .set({ status: "UNLOCKED", updatedAt: new Date() })
                  .where(eq(teamTiers.id, nextTeamTier.id));
              }
            } else {
              await db.insert(teamTiers).values({
                teamId: team.id,
                tierId: nextTierRecord.id,
                status: "UNLOCKED",
                retriesRemaining: 2,
              });
            }
          }
        }
      }

      result = {
        success: true,
        isCorrect: false,
        retriesRemaining: newRetries,
        tierFailed,
        nextTierId,
        nextTierUnlocked,
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/tier/${questionRecord.tierId}`);

    return result;

  } catch (error: any) {
    console.error("Error in submitAnswer:", error);
    const errMessage = error?.message || "";
    if (error?.code === "23505" || errMessage.toLowerCase().includes("unique") || errMessage.toLowerCase().includes("duplicate")) {
      return {
        success: false,
        error: "This question has already been solved by your team.",
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred during answer validation.",
    };
  }
}

