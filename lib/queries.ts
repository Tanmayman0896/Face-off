import { db } from "@/db";
import { teams, tiers, teamTiers, questions, teamQuestionRewards, players, teamPlayers } from "@/db/schema";
import { eq, and, asc, desc, sql, inArray } from "drizzle-orm";
import { getAuthSession, getCurrentTeam } from "@/lib/auth";

export interface DashboardTier {
  id: string; // team_tiers record id
  tierId: string; // tiers record id
  tierNumber: number;
  name: string;
  description: string;
  status: "LOCKED" | "UNLOCKED" | "COMPLETED" | "FAILED";
  retriesRemaining: number;
  totalQuestions: number;
  solvedQuestions: number;
  totalReward: number;
  unlockRequirement?: string;
}

export interface DashboardData {
  team: {
    id: string;
    teamName: string;
    teamLeaderName: string;
    balance: number;
  };
  tiers: DashboardTier[];
}

export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return null;
    }

    const team = await getCurrentTeam();
    if (!team) {
      return null;
    }

    // Fetch all tiers ordered by tierNumber
    const allTiers = await db
      .select()
      .from(tiers)
      .orderBy(asc(tiers.tierNumber));

    // Fetch all team_tiers for this team
    const allTeamTiers = await db
      .select()
      .from(teamTiers)
      .where(eq(teamTiers.teamId, team.id));

    const teamTierMap = new Map(allTeamTiers.map((tt) => [tt.tierId, tt]));

    const dashboardTiers: DashboardTier[] = [];
    let previousTierCompleted = true; // Tier 1 defaults to unlocked if preceding is completed (or initial)

    for (let i = 0; i < allTiers.length; i++) {
      const tier = allTiers[i];
      let teamTierRecord = teamTierMap.get(tier.id);

      // If team_tier record doesn't exist yet, insert default
      if (!teamTierRecord) {
        const isTier1 = tier.tierNumber === 1;
        const initialStatus = isTier1 ? "UNLOCKED" : "LOCKED";
        const [inserted] = await db
          .insert(teamTiers)
          .values({
            teamId: team.id,
            tierId: tier.id,
            status: initialStatus,
            retriesRemaining: 2,
          })
          .returning();
        teamTierRecord = inserted;
      }

      // Fetch questions for this tier
      const questionsForTier = await db
        .select({ id: questions.id, reward: questions.reward })
        .from(questions)
        .where(eq(questions.tierId, tier.id));

      const totalQuestions = questionsForTier.length;
      const totalReward = questionsForTier.reduce((sum, q) => sum + q.reward, 0);

      // Count solved questions for team in this tier
      let solvedQuestions = 0;
      if (totalQuestions > 0) {
        const questionIds = questionsForTier.map((q) => q.id);
        const solvedRecords = await db
          .select({ count: sql<number>`count(distinct ${teamQuestionRewards.questionId})::int` })
          .from(teamQuestionRewards)
          .where(
            and(
              eq(teamQuestionRewards.teamId, team.id),
              inArray(teamQuestionRewards.questionId, questionIds)
            )
          );
        solvedQuestions = Number(solvedRecords[0]?.count ?? 0);
      }

      // State machine logic for status
      let computedStatus = teamTierRecord.status as "LOCKED" | "UNLOCKED" | "COMPLETED" | "FAILED";

      if (totalQuestions > 0 && solvedQuestions >= totalQuestions) {
        computedStatus = "COMPLETED";
      } else if (teamTierRecord.retriesRemaining <= 0 && solvedQuestions < totalQuestions) {
        computedStatus = "FAILED";
      } else if (tier.tierNumber === 1) {
        if (computedStatus !== "COMPLETED" && computedStatus !== "FAILED") {
          computedStatus = "UNLOCKED";
        }
      } else if (tier.tierNumber > 1) {
        if (previousTierCompleted && computedStatus === "LOCKED") {
          computedStatus = "UNLOCKED";
        }
      }

      // Sync status changes with PostgreSQL DB
      if (computedStatus !== teamTierRecord.status) {
        await db
          .update(teamTiers)
          .set({
            status: computedStatus,
            updatedAt: new Date(),
          })
          .where(eq(teamTiers.id, teamTierRecord.id));
      }

      let unlockRequirement: string | undefined = undefined;
      if (computedStatus === "LOCKED") {
        unlockRequirement = `🔒 Complete Tier ${tier.tierNumber - 1}`;
      }

      dashboardTiers.push({
        id: teamTierRecord.id,
        tierId: tier.id,
        tierNumber: tier.tierNumber,
        name: tier.name,
        description: tier.description,
        status: computedStatus,
        retriesRemaining: teamTierRecord.retriesRemaining,
        totalQuestions,
        solvedQuestions,
        totalReward,
        unlockRequirement,
      });

      previousTierCompleted = computedStatus === "COMPLETED";
    }

    return {
      team: {
        id: team.id,
        teamName: team.teamName,
        teamLeaderName: team.teamLeaderName,
        balance: team.balance,
      },
      tiers: dashboardTiers,
    };
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return null;
  }
}

export interface SafeQuestion {
  id: string;
  tierId: string;
  question: string;
  reward: number;
  isSolved: boolean;
}

export interface TierQuestionPageData {
  team: {
    id: string;
    teamName: string;
    balance: number;
  };
  tier: {
    id: string;
    tierNumber: number;
    name: string;
    description: string;
    status: "UNLOCKED" | "COMPLETED" | "FAILED";
    retriesRemaining: number;
  };
  questions: SafeQuestion[];
}

export async function getTierQuestionDetails(
  tierId: string
): Promise<TierQuestionPageData | { redirect: boolean } | null> {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return null;
    }

    const team = await getCurrentTeam();
    if (!team) {
      return null;
    }

    // 1. Fetch Tier Record
    const [tierRecord] = await db
      .select()
      .from(tiers)
      .where(eq(tiers.id, tierId))
      .limit(1);

    if (!tierRecord) {
      return { redirect: true };
    }

    // 2. Fetch Team Tier status
    let [teamTierRecord] = await db
      .select()
      .from(teamTiers)
      .where(and(eq(teamTiers.teamId, team.id), eq(teamTiers.tierId, tierId)))
      .limit(1);

    // If record missing, create if tierNumber == 1
    if (!teamTierRecord) {
      if (tierRecord.tierNumber === 1) {
        const [inserted] = await db
          .insert(teamTiers)
          .values({
            teamId: team.id,
            tierId: tierId,
            status: "UNLOCKED",
            retriesRemaining: 2,
          })
          .returning();
        teamTierRecord = inserted;
      } else {
        return { redirect: true };
      }
    }

    // Double-guard: For Tier > 1, verify previous tier is COMPLETED
    if (tierRecord.tierNumber > 1) {
      const [prevTier] = await db
        .select()
        .from(tiers)
        .where(eq(tiers.tierNumber, tierRecord.tierNumber - 1))
        .limit(1);

      if (prevTier) {
        const [prevTeamTier] = await db
          .select()
          .from(teamTiers)
          .where(and(eq(teamTiers.teamId, team.id), eq(teamTiers.tierId, prevTier.id)))
          .limit(1);

        if (!prevTeamTier || prevTeamTier.status !== "COMPLETED") {
          return { redirect: true };
        }
      }
    }

    // Check access control rules
    const status = teamTierRecord.status as "LOCKED" | "UNLOCKED" | "COMPLETED" | "FAILED";

    if (status === "LOCKED" || status === "FAILED") {
      return { redirect: true };
    }

    if (status !== "COMPLETED" && teamTierRecord.retriesRemaining <= 0) {
      // Sync failed status if not already set
      await db
        .update(teamTiers)
        .set({ status: "FAILED", updatedAt: new Date() })
        .where(eq(teamTiers.id, teamTierRecord.id));
      return { redirect: true };
    }

    // 3. Fetch questions explicitly excluding `answer`
    const tierQuestions = await db
      .select({
        id: questions.id,
        tierId: questions.tierId,
        question: questions.question,
        reward: questions.reward,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(eq(questions.tierId, tierId))
      .orderBy(asc(questions.createdAt));

    // 4. Fetch solved questions for this team
    const questionIds = tierQuestions.map((q) => q.id);
    const solvedRewards = questionIds.length > 0
      ? await db
          .select({ questionId: teamQuestionRewards.questionId })
          .from(teamQuestionRewards)
          .where(
            and(
              eq(teamQuestionRewards.teamId, team.id),
              inArray(teamQuestionRewards.questionId, questionIds)
            )
          )
      : [];

    const solvedSet = new Set(solvedRewards.map((r) => r.questionId));

    const safeQuestions: SafeQuestion[] = tierQuestions.map((q) => ({
      id: q.id,
      tierId: q.tierId,
      question: q.question,
      reward: q.reward,
      isSolved: solvedSet.has(q.id),
    }));

    return {
      team: {
        id: team.id,
        teamName: team.teamName,
        balance: team.balance,
      },
      tier: {
        id: tierRecord.id,
        tierNumber: tierRecord.tierNumber,
        name: tierRecord.name,
        description: tierRecord.description,
        status,
        retriesRemaining: teamTierRecord.retriesRemaining,
      },
      questions: safeQuestions,
    };
  } catch (error) {
    console.error("Error in getTierQuestionDetails:", error);
    return { redirect: true };
  }
}

export interface MarketplacePlayer {
  id: string;
  tierNumber: number;
  position: "Striker" | "Midfielder" | "Defender" | "Goalkeeper";
  playerName: string;
  price: number;
  speed: number;
  physical: number;
  technique: number;
  stamina: number;
  precision: number;
  defense: number;
  pros: string;
  cons: string;
  overallScore: number;
  isOwned: boolean;
}

export interface MarketplaceData {
  team: {
    id: string;
    teamName: string;
    teamLeaderName: string;
    balance: number;
  };
  players: MarketplacePlayer[];
  ownedCount: number;
}

export async function getMarketplaceData(): Promise<MarketplaceData | null> {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return null;
    }

    const team = await getCurrentTeam();
    if (!team) {
      return null;
    }

    // Fetch all players ordered by Tier ascending, then Overall Score descending
    const allPlayers = await db
      .select()
      .from(players)
      .orderBy(asc(players.tierNumber), desc(players.overallScore), asc(players.playerName));

    // Fetch owned players for current team
    const ownedRecords = await db
      .select({ playerId: teamPlayers.playerId })
      .from(teamPlayers)
      .where(eq(teamPlayers.teamId, team.id));

    const ownedSet = new Set(ownedRecords.map((r) => r.playerId));

    const mappedPlayers: MarketplacePlayer[] = allPlayers.map((p) => ({
      id: p.id,
      tierNumber: p.tierNumber,
      position: p.position as "Striker" | "Midfielder" | "Defender" | "Goalkeeper",
      playerName: p.playerName,
      price: p.price,
      speed: p.speed,
      physical: p.physical,
      technique: p.technique,
      stamina: p.stamina,
      precision: p.precision,
      defense: p.defense,
      pros: p.pros,
      cons: p.cons,
      overallScore: p.overallScore,
      isOwned: ownedSet.has(p.id),
    }));

    return {
      team: {
        id: team.id,
        teamName: team.teamName,
        teamLeaderName: team.teamLeaderName,
        balance: team.balance,
      },
      players: mappedPlayers,
      ownedCount: ownedSet.size,
    };
  } catch (error) {
    console.error("Error in getMarketplaceData:", error);
    return null;
  }
}



