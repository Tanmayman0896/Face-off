import { db } from "../db";
import { tiers, questions } from "../db/schema";
import { eq } from "drizzle-orm";

export const EXPECTED_TIER_1_QUESTIONS = [
  { question: "A train 100 meters long traveling at 60 km/h passes a telegraph pole. How many seconds does it take?", answer: "6 seconds" },
  { question: "In a single-elimination tournament with 128 players, how many total matches must be played to determine the champion?", answer: "127 matches" },
  { question: "In a room of 12 people, everyone shakes hands with everyone else exactly once. How many total handshakes occur?", answer: "66" },
  { question: "What is the angle (in degrees) between the hour and minute hands of an analog clock at 3:15?", answer: "7.5 degrees" },
  { question: "A frog is at the bottom of a 20-foot well. Each day it climbs up 3 feet, but slips back 2 feet each night. How many days does it take to reach the top?", answer: "18 days" },
  { question: "How many total times does the digit 9 appear in the numbers from 1 to 100?", answer: "20 times" },
  { question: "A mother is 3 times as old as her daughter. In 12 years, she will be twice as old. How old is the daughter now?", answer: "12 years old" },
  { question: "You drive 60 km at 30 km/h, then return the same 60 km at 60 km/h. What is your average speed for the whole trip?", answer: "40 km/h" },
  { question: "A doctor gives a patient 4 pills and instructs them to take one every 30 minutes. How many minutes will the pills last?", answer: "90 minutes" },
  { question: "What is the next number in the sequence: 2, 6, 12, 20, 30, 42, ___?", answer: "56" },
  { question: "How many total squares of any size exist on a 4x4 grid?", answer: "30" },
  { question: "If 5 cats catch 5 mice in 5 minutes, how many cats are needed to catch 100 mice in 100 minutes?", answer: "5 cats" },
  { question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost in cents?", answer: "5 cents" },
  { question: "If a non-leap year starts on a Monday (January 1st), what day of the week will December 31st fall on in that same year?", answer: "Monday" },
  { question: "What letter comes next in the sequence: O, T, T, F, F, S, S, E, ___?", answer: "N" },
  { question: "You overtake the person running in 3rd place during a marathon. What position are you in now?", answer: "3rd place" },
  { question: "What is the smallest positive integer that leaves a remainder of 1 when divided by 2, 3, and 4?", answer: "13" },
  { question: "What 3 distinct positive whole numbers give the exact same answer whether they are added together or multiplied together?", answer: "1, 2, and 3" },
  { question: "Pointing to a photo, a man says, \"I have no siblings, but that man's father is my father's son.\" Who is in the photo?", answer: "His son" },
  { question: "What is the probability of rolling a sum of 7 when rolling two standard 6-sided dice?", answer: "1/6 (or 16.67%)" },
  { question: "A 3x3x3 cube painted red on all outer surfaces is cut into 27 smaller 1x1x1 cubes. How many small cubes have EXACTLY 2 red faces?", answer: "12 Cubes" },
  { question: "What is the next number in the sequence: 3, 5, 9, 17, 33, ___?", answer: "65" },
  { question: "You walk 10 meters South, turn Left and walk 10 meters, then turn Left again and walk 10 meters. How far are you from your starting point?", answer: "10 meters East" },
  { question: "In a class of 50 students, 30 play cricket, 25 play football, and 10 play both. How many students play neither sport?", answer: "5 students" },
  { question: "If 4 workers can build a wall in 4 days, how many days will it take 2 workers to build the exact same wall?", answer: "8 days" },
  { question: "You have 9 identical coins, but 1 is counterfeit and slightly lighter. What is the minimum number of weighings on a balance scale to guarantee finding it?", answer: "2 weighings" },
  { question: "What is the next letter in the sequence: A, C, F, J, O, ___?", answer: "U" },
  { question: "How many 2-digit numbers can be formed using the digits 1, 2, 3, and 4 without repeating any digit?", answer: "12" },
  { question: "What letter comes next in the sequence: Z, X, V, T, R, ___?", answer: "P" },
  { question: "A 12-rung ladder hangs over the side of a boat with rungs spaced 1 foot apart. The tide rises at 2 feet per hour. How many rungs are underwater after 3 hours?", answer: "0 rungs" },
  { question: "Which number does NOT belong in the set: 2, 3, 5, 7, 9, 11, 13?", answer: "9" },
  { question: "What is the next term in the cubic sequence: 1, 8, 27, 64, 125, __?", answer: "216" },
  { question: "How many times in a 12-hour period do the hour and minute hands of an analog clock overlap?", answer: "11 times" },
  { question: "If \"CAT\" is coded as 24 and \"DOG\" is coded as 26 (using A=1, B=2...), what is the numerical value of \"PIG\"?", answer: "32" },
  { question: "If all Bloops are Razzies, and all Razzies are Lazzies, are all Bloops definitely Lazzies?", answer: "Yes" },
  { question: "What is the next number in the pattern based on English word length: 3, 3, 5, 4, 4, 3, 5, 5, 4, ___?", answer: "3" },
  { question: "Two fair coins are flipped. What is the probability that at least one lands on Heads?", answer: "75% (or 3/4)" },
  { question: "What is the 10th term in the doubling sequence: 2, 4, 8, 16, 32... ?", answer: "1024" },
  { question: "A father and son are in a car crash. The father dies. The son is rushed to surgery. The surgeon looks at the boy and says, \"I cannot operate, he is my son!\" Who is the surgeon?", answer: "His mother" },
  { question: "What is the product of all numbers on a standard telephone keypad (0 through 9)?", answer: "0" },
];

async function verifyTier1Questions() {
  console.log("🔍 Verification Starting: Checking Tier 1 Questions in Database...\n");

  // 1. Fetch Tier 1 record
  const tier1List = await db.select().from(tiers).where(eq(tiers.tierNumber, 1));
  if (tier1List.length === 0) {
    console.error("❌ Tier 1 record does not exist in tiers table!");
    process.exit(1);
  }

  const tier1 = tier1List[0];
  console.log(`✓ Tier 1 Found (ID: ${tier1.id})`);

  // 2. Fetch all Tier 1 questions from DB
  const dbQuestions = await db
    .select({
      id: questions.id,
      question: questions.question,
      answer: questions.answer,
      reward: questions.reward,
    })
    .from(questions)
    .where(eq(questions.tierId, tier1.id));

  console.log(`📊 DB Question Count for Tier 1: ${dbQuestions.length} / Expected: ${EXPECTED_TIER_1_QUESTIONS.length}\n`);

  const dbQuestionMap = new Map(dbQuestions.map((q) => [q.question, q.answer]));

  let passedCount = 0;
  let missingCount = 0;
  let mismatchCount = 0;

  console.log("--------------------------------------------------------------------------------");
  console.log("#  | Question Text                                   | Expected Ans | DB Ans  | Status");
  console.log("--------------------------------------------------------------------------------");

  EXPECTED_TIER_1_QUESTIONS.forEach((exp, idx) => {
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
  console.log(`   - Total Expected Questions: ${EXPECTED_TIER_1_QUESTIONS.length}`);
  console.log(`   - Total Questions in DB:    ${dbQuestions.length}`);
  console.log(`   - Passed (Found & Correct):  ${passedCount}`);
  console.log(`   - Missing Questions:        ${missingCount}`);
  console.log(`   - Mismatched Answers:       ${mismatchCount}`);

  if (passedCount === EXPECTED_TIER_1_QUESTIONS.length && dbQuestions.length === EXPECTED_TIER_1_QUESTIONS.length) {
    console.log("\n🎉 ALL TIER 1 QUESTIONS AND ANSWERS VERIFIED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("\n❌ VERIFICATION FAILED! Details shown above.");
    process.exit(1);
  }
}

verifyTier1Questions().catch((err) => {
  console.error("❌ Error running verification script:", err);
  process.exit(1);
});
