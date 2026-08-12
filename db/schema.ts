import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// 1. Teams Table
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: varchar("auth_user_id", { length: 255 }).notNull().unique(),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  teamLeaderName: varchar("team_leader_name", { length: 255 }).notNull(),
  balance: integer("balance").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Tiers Table
export const tiers = pgTable("tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tierNumber: integer("tier_number").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Questions Table
export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tierId: uuid("tier_id")
    .references(() => tiers.id, { onDelete: "cascade" })
    .notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(), // Server-only, never returned to client
  reward: integer("reward").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Team Tiers Table
export const teamTiers = pgTable(
  "team_tiers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    tierId: uuid("tier_id")
      .references(() => tiers.id, { onDelete: "cascade" })
      .notNull(),
    status: varchar("status", { length: 50 }).notNull(), // 'LOCKED' | 'UNLOCKED' | 'COMPLETED' | 'FAILED'
    retriesRemaining: integer("retries_remaining").default(2).notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("team_tier_idx").on(table.teamId, table.tierId),
  ]
);

// 5. Question Attempts Table
export const questionAttempts = pgTable("question_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  tierId: uuid("tier_id")
    .references(() => tiers.id, { onDelete: "cascade" })
    .notNull(),
  submittedAnswer: text("submitted_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

// 6. Team Question Rewards Table
export const teamQuestionRewards = pgTable(
  "team_question_rewards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    rewardAmount: integer("reward_amount").notNull(),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("team_question_reward_idx").on(table.teamId, table.questionId),
  ]
);

// 7. Players Table (Marketplace Catalog)
export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  tierNumber: integer("tier_number").notNull(), // 1, 2, or 3
  position: varchar("position", { length: 50 }).notNull(), // 'Striker' | 'Midfielder' | 'Defender' | 'Goalkeeper'
  playerName: varchar("playerName", { length: 255 }).notNull().unique(),
  price: integer("price").notNull(),
  speed: integer("speed").notNull(),
  physical: integer("physical").notNull(),
  technique: integer("technique").notNull(),
  stamina: integer("stamina").notNull(),
  precision: integer("precision").notNull(),
  defense: integer("defense").notNull(),
  pros: text("pros").notNull(),
  cons: text("cons").notNull(),
  overallScore: integer("overall_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Team Players Table (Purchased Squad)
export const teamPlayers = pgTable(
  "team_players",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    playerId: uuid("player_id")
      .references(() => players.id, { onDelete: "cascade" })
      .notNull(),
    purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("team_player_idx").on(table.teamId, table.playerId),
  ]
);

