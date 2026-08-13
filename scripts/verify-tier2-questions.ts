import { db } from "../db";
import { tiers, questions } from "../db/schema";
import { eq } from "drizzle-orm";

export const EXPECTED_TIER_2_QUESTIONS = [
  { question: "Find the next number: 3, 8, 15, 24, 35, ?", answer: "48" },
  { question: "Find the next number: 2, 6, 12, 20, 30, ?", answer: "42" },
  { question: "8 : 64 :: 12 : ?", answer: "144" },
  { question: "7 : 42 :: 9 : ?", answer: "72" },
  { question: "Find the next letter: B, E, I, N, T, ?", answer: "A" },
  { question: "Find the next letter: Z, W, S, N, H, ?", answer: "A" },
  { question: "I am an odd number. Take away one letter and I become even. What am I?", answer: "Seven" },
  { question: "The more you take from me, the bigger I become. What am I?", answer: "A hole" },
  { question: "I have keys but no locks, I have space but no room, and you can enter but can't go inside. What am I?", answer: "Keyboard" },
  { question: "What has cities, roads and rivers but no people, cars or water?", answer: "Map" },
  { question: "64, 81, 100, 121, 143 — which does not belong?", answer: "143" },
  { question: "3, 5, 11, 17, 23, 27 — which does not belong?", answer: "27" },
  { question: "If CAT = 24 and DOG = 26, using A=1, B=2...Z=26, what is BIRD?", answer: "33" },
  { question: "If APPLE is coded as BQQMF, how is GRAPE coded?", answer: "HSBQF" },
  { question: "Find the missing number: 4, 9, 19, 39, 79, ?", answer: "159" },
  { question: "Find the missing number: 81, 27, 9, 3, ?", answer: "1" },
  { question: "All roses are flowers. Some flowers fade quickly. Can we conclude that some roses fade quickly?", answer: "No" },
  { question: "All A are B. All B are C. Therefore, all A are C. Is the statement logically valid?", answer: "Yes" },
  { question: "A father is 3 times as old as his son. In 12 years, he will be twice as old as his son. How old is the son now?", answer: "12 years" },
  { question: "A is 5 years older than B. B is twice as old as C. If C is 7, how old is A?", answer: "19 years" },
  { question: "Five people A, B, C, D and E stand in a line. A is left of B, C is right of B, D is left of A, and E is right of C. Who is in the middle?", answer: "B" },
  { question: "P, Q, R, S and T sit in a row. Q is immediately right of P. R is immediately left of T. S is between Q and R. Who sits in the middle?", answer: "S" },
  { question: "You walk 5 m north, then 5 m east, then 5 m south. How far are you from your starting point?", answer: "5 m" },
  { question: "A person walks 10 m east, turns left and walks 5 m, then turns left and walks 10 m. Which direction is the person facing?", answer: "West" },
  { question: "What is the angle between the hour and minute hands at exactly 3:30?", answer: "75°" },
  { question: "What is the angle between the hour and minute hands at exactly 6:00?", answer: "180°" },
  { question: "If 5 machines make 5 items in 5 minutes, how many machines are needed to make 100 items in 100 minutes?", answer: "5" },
  { question: "A clock loses 10 minutes every hour. If it is set correctly at 12:00, what will it show after 6 real hours?", answer: "5:00" },
  { question: "Find the missing number: 2, 3, 5, 8, 12, 17, ?", answer: "23" },
  { question: "Find the missing number: 1, 4, 10, 22, 46, ?", answer: "94" },
  { question: "If all ZIPS are ZAPS, and no ZAPS are ZOPS, can any ZIP be a ZOP?", answer: "No" },
  { question: "Rearrange the letters CIFAIPC to form the name of a geographical feature.", answer: "PACIFIC" },
  { question: "In a race, you overtake the person in 2nd place. What position are you now in?", answer: "2nd" },
  { question: "There are 30 students in a class. Rahul ranks 12th from the top. What is his rank from the bottom?", answer: "19th" },
  { question: "3 + 4 = 21, 5 + 2 = 21, 6 + 3 = 45. Then 7 + 4 = ?", answer: "77" },
  { question: "2 × 3 = 8, 3 × 4 = 15, 4 × 5 = 24. Then 5 × 6 = ?", answer: "35" },
  { question: "Three boxes are labelled Apples, Oranges and Mixed. Every label is wrong. You may pick one fruit from one box. Which box should you pick from first?", answer: "Mixed" },
  { question: "A man looks at a photograph and says: \"Brothers and sisters, I have none. But that man's father is my father's son.\" Who is in the photograph?", answer: "His son" },
  { question: "What comes next? Monday, Wednesday, Saturday, Wednesday, Monday, ?", answer: "Saturday" },
  { question: "A number is multiplied by 3 and then 6 is added. The result is 30. What is the number?", answer: "8" },
];

async function verifyTier2Questions() {
  console.log("🔍 Verification Starting: Checking Tier 2 Questions in Database...\n");

  // 1. Fetch Tier 2 record
  const tier2List = await db.select().from(tiers).where(eq(tiers.tierNumber, 2));
  if (tier2List.length === 0) {
    console.error("❌ Tier 2 record does not exist in tiers table!");
    process.exit(1);
  }

  const tier2 = tier2List[0];
  console.log(`✓ Tier 2 Found (ID: ${tier2.id})`);

  // 2. Fetch all Tier 2 questions from DB
  const dbQuestions = await db
    .select({
      id: questions.id,
      question: questions.question,
      answer: questions.answer,
      reward: questions.reward,
    })
    .from(questions)
    .where(eq(questions.tierId, tier2.id));

  console.log(`📊 DB Question Count for Tier 2: ${dbQuestions.length} / Expected: ${EXPECTED_TIER_2_QUESTIONS.length}\n`);

  const dbQuestionMap = new Map(dbQuestions.map((q) => [q.question, q.answer]));

  let passedCount = 0;
  let missingCount = 0;
  let mismatchCount = 0;

  console.log("--------------------------------------------------------------------------------");
  console.log("#  | Question Text                                   | Expected Ans | DB Ans  | Status");
  console.log("--------------------------------------------------------------------------------");

  EXPECTED_TIER_2_QUESTIONS.forEach((exp, idx) => {
    const num = (idx + 1).toString().padStart(2, " ");
    const shortQ = exp.question.length > 48 ? exp.question.slice(0, 45) + "..." : exp.question.padEnd(48, " ");
    const expAns = exp.answer.padEnd(12, " ");

    if (!dbQuestionMap.has(exp.question)) {
      missingCount++;
      console.log(`${num} | ${shortQ} | ${expAns} | NOT FOUND | ❌ MISSING`);
    } else {
      const actualAns = dbQuestionMap.get(exp.question)!;
      const actualAnsStr = actualAns.padEnd(7, " ");
      if (actualAns === exp.answer) {
        passedCount++;
        console.log(`${num} | ${shortQ} | ${expAns} | ${actualAnsStr} | ✅ PASS`);
      } else {
        mismatchCount++;
        console.log(`${num} | ${shortQ} | ${expAns} | ${actualAnsStr} | ❌ MISMATCH`);
      }
    }
  });

  console.log("--------------------------------------------------------------------------------\n");
  console.log("📋 Summary Report:");
  console.log(`   - Total Expected Questions: ${EXPECTED_TIER_2_QUESTIONS.length}`);
  console.log(`   - Total Questions in DB:    ${dbQuestions.length}`);
  console.log(`   - Passed (Found & Correct):  ${passedCount}`);
  console.log(`   - Missing Questions:        ${missingCount}`);
  console.log(`   - Mismatched Answers:       ${mismatchCount}`);

  if (passedCount === EXPECTED_TIER_2_QUESTIONS.length && dbQuestions.length === EXPECTED_TIER_2_QUESTIONS.length) {
    console.log("\n🎉 ALL TIER 2 QUESTIONS AND ANSWERS VERIFIED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("\n❌ VERIFICATION FAILED! Details shown above.");
    process.exit(1);
  }
}

verifyTier2Questions().catch((err) => {
  console.error("❌ Error running verification script:", err);
  process.exit(1);
});
