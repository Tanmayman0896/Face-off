import { db } from "../db";
import { tiers, questions } from "../db/schema";
import { eq } from "drizzle-orm";

export const EXPECTED_TIER_3_QUESTIONS = [
  { question: "How many months in a year have 28 days?", answer: "12" },
  { question: "What goes up when rain comes down?", answer: "Umbrella" },
  { question: "What has hands but cannot clap?", answer: "Clock" },
  { question: "What belongs to you, but other people use it more than you do?", answer: "Name" },
  { question: "What has a head and a tail, but no body?", answer: "Coin" },
  { question: "If you have 3 apples and you take away 2, how many apples do you have?", answer: "2" },
  { question: "What gets wetter the more it dries?", answer: "Towel" },
  { question: "What can you break, even if you never pick it up or touch it?", answer: "Promise" },
  { question: "What key cannot open any door?", answer: "Donkey" },
  { question: "What has many keys but can't open a single lock?", answer: "Piano" },
  { question: "What goes up but never comes down?", answer: "Age" },
  { question: "If a red house is made of red bricks, and a blue house is made of blue bricks, what is a greenhouse made of?", answer: "Glass" },
  { question: "What has words, but never speaks?", answer: "Book" },
  { question: "What runs all around the backyard, yet never moves?", answer: "Fence" },
  { question: "What has legs, but doesn't walk?", answer: "Table" },
  { question: "What travels around the world while staying in a corner?", answer: "Stamp" },
  { question: "What has a neck but no head?", answer: "Bottle" },
  { question: "What can you catch, but not throw?", answer: "Cold" },
  { question: "What is full of holes but still holds water?", answer: "Sponge" },
  { question: "What gets bigger the more you take away from it?", answer: "Hole" },
  { question: "How many sides does a circle have?", answer: "2" },
  { question: "What has one eye, but can't see?", answer: "Needle" },
  { question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "M" },
  { question: "Which is heavier: 1 kg of feathers or 1 kg of iron?", answer: "Equal" },
  { question: "What has a thumb and four fingers, but is not a living thing?", answer: "Glove" },
  { question: "If an electric train is traveling south, which way does the smoke blow?", answer: "None" },
  { question: "What has teeth but cannot bite?", answer: "Comb" },
  { question: "What color is a black box on a commercial airplane?", answer: "Orange" },
  { question: "What builds up when you don't clean your room, but disappears when you sweep?", answer: "Dust" },
  { question: "What has a face and two hands, but no arms or legs?", answer: "Clock" },
  { question: "If you freeze water, what do you get?", answer: "Ice" },
  { question: "What is always in front of you but can't be seen?", answer: "Future" },
  { question: "What has a bottom at the top?", answer: "Legs" },
  { question: "If a plane crashes directly on the border of the US and Canada, where do you bury the survivors?", answer: "Nowhere" },
  { question: "What ends everything?", answer: "G" },
  { question: "What can you hold in your left hand, but never in your right hand?", answer: "Elbow" },
  { question: "What ring is square?", answer: "Boxing" },
  { question: "What basic digit increases in value when turned upside down?", answer: "6" },
  { question: "What kind of band never plays music?", answer: "Rubber" },
  { question: "What has many needle points, but doesn't sew?", answer: "Cactus" },
];

async function verifyTier3Questions() {
  console.log("🔍 Verification Starting: Checking Tier 3 Questions in Database...\n");

  // 1. Fetch Tier 3 record
  const tier3List = await db.select().from(tiers).where(eq(tiers.tierNumber, 3));
  if (tier3List.length === 0) {
    console.error("❌ Tier 3 record does not exist in tiers table!");
    process.exit(1);
  }

  const tier3 = tier3List[0];
  console.log(`✓ Tier 3 Found (ID: ${tier3.id})`);

  // 2. Fetch all Tier 3 questions from DB
  const dbQuestions = await db
    .select({
      id: questions.id,
      question: questions.question,
      answer: questions.answer,
      reward: questions.reward,
    })
    .from(questions)
    .where(eq(questions.tierId, tier3.id));

  console.log(`📊 DB Question Count for Tier 3: ${dbQuestions.length} / Expected: ${EXPECTED_TIER_3_QUESTIONS.length}\n`);

  const dbQuestionMap = new Map(dbQuestions.map((q) => [q.question, q.answer]));

  let passedCount = 0;
  let missingCount = 0;
  let mismatchCount = 0;

  console.log("--------------------------------------------------------------------------------");
  console.log("#  | Question Text                                   | Expected Ans | DB Ans  | Status");
  console.log("--------------------------------------------------------------------------------");

  EXPECTED_TIER_3_QUESTIONS.forEach((exp, idx) => {
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
  console.log(`   - Total Expected Questions: ${EXPECTED_TIER_3_QUESTIONS.length}`);
  console.log(`   - Total Questions in DB:    ${dbQuestions.length}`);
  console.log(`   - Passed (Found & Correct):  ${passedCount}`);
  console.log(`   - Missing Questions:        ${missingCount}`);
  console.log(`   - Mismatched Answers:       ${mismatchCount}`);

  if (passedCount === EXPECTED_TIER_3_QUESTIONS.length && dbQuestions.length === EXPECTED_TIER_3_QUESTIONS.length) {
    console.log("\n🎉 ALL TIER 3 QUESTIONS AND ANSWERS VERIFIED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("\n❌ VERIFICATION FAILED! Details shown above.");
    process.exit(1);
  }
}

verifyTier3Questions().catch((err) => {
  console.error("❌ Error running verification script:", err);
  process.exit(1);
});
