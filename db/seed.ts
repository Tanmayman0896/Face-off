import { db } from "./index";
import { tiers, questions, players } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting database seed...");

  const tierData = [
    {
      tierNumber: 1,
      name: "Tier 1",
      description: "Master Tier - Hardest quantitative logic, complex math puzzles, and advanced reasoning.",
    },
    {
      tierNumber: 2,
      name: "Tier 2",
      description: "Pro Tier - Intermediate pattern recognition, sequence puzzles, and logical deductions.",
    },
    {
      tierNumber: 3,
      name: "Tier 3",
      description: "Novice Tier - Basic lateral thinking, classic riddles, and fun wordplay puzzles.",
    },
  ];

  const seededTiers: Record<number, string> = {};

  for (const t of tierData) {
    const existing = await db
      .select()
      .from(tiers)
      .where(eq(tiers.tierNumber, t.tierNumber));

    if (existing.length > 0) {
      seededTiers[t.tierNumber] = existing[0].id;
      await db
        .update(tiers)
        .set({
          name: t.name,
          description: t.description,
        })
        .where(eq(tiers.tierNumber, t.tierNumber));
      console.log(`✓ Updated Tier ${t.tierNumber} (${existing[0].id})`);
    } else {
      const [inserted] = await db
        .insert(tiers)
        .values({
          tierNumber: t.tierNumber,
          name: t.name,
          description: t.description,
        })
        .returning();
      seededTiers[t.tierNumber] = inserted.id;
      console.log(`+ Inserted Tier ${t.tierNumber} (${inserted.id})`);
    }
  }

  const questionData = [
    // Tier 1 Questions (40 Questions) - Hardest ($300 reward)
    { tierNumber: 1, question: "A train 100 meters long traveling at 60 km/h passes a telegraph pole. How many seconds does it take?", answer: "6 seconds", reward: 300 },
    { tierNumber: 1, question: "In a single-elimination tournament with 128 players, how many total matches must be played to determine the champion?", answer: "127 matches", reward: 300 },
    { tierNumber: 1, question: "In a room of 12 people, everyone shakes hands with everyone else exactly once. How many total handshakes occur?", answer: "66", reward: 300 },
    { tierNumber: 1, question: "What is the angle (in degrees) between the hour and minute hands of an analog clock at 3:15?", answer: "7.5 degrees", reward: 300 },
    { tierNumber: 1, question: "A frog is at the bottom of a 20-foot well. Each day it climbs up 3 feet, but slips back 2 feet each night. How many days does it take to reach the top?", answer: "18 days", reward: 300 },
    { tierNumber: 1, question: "How many total times does the digit 9 appear in the numbers from 1 to 100?", answer: "20 times", reward: 300 },
    { tierNumber: 1, question: "A mother is 3 times as old as her daughter. In 12 years, she will be twice as old. How old is the daughter now?", answer: "12 years old", reward: 300 },
    { tierNumber: 1, question: "You drive 60 km at 30 km/h, then return the same 60 km at 60 km/h. What is your average speed for the whole trip?", answer: "40 km/h", reward: 300 },
    { tierNumber: 1, question: "A doctor gives a patient 4 pills and instructs them to take one every 30 minutes. How many minutes will the pills last?", answer: "90 minutes", reward: 300 },
    { tierNumber: 1, question: "What is the next number in the sequence: 2, 6, 12, 20, 30, 42, ___?", answer: "56", reward: 300 },
    { tierNumber: 1, question: "How many total squares of any size exist on a 4x4 grid?", answer: "30", reward: 300 },
    { tierNumber: 1, question: "If 5 cats catch 5 mice in 5 minutes, how many cats are needed to catch 100 mice in 100 minutes?", answer: "5 cats", reward: 300 },
    { tierNumber: 1, question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost in cents?", answer: "5 cents", reward: 300 },
    { tierNumber: 1, question: "If a non-leap year starts on a Monday (January 1st), what day of the week will December 31st fall on in that same year?", answer: "Monday", reward: 300 },
    { tierNumber: 1, question: "What letter comes next in the sequence: O, T, T, F, F, S, S, E, ___?", answer: "N", reward: 300 },
    { tierNumber: 1, question: "You overtake the person running in 3rd place during a marathon. What position are you in now?", answer: "3rd place", reward: 300 },
    { tierNumber: 1, question: "What is the smallest positive integer that leaves a remainder of 1 when divided by 2, 3, and 4?", answer: "13", reward: 300 },
    { tierNumber: 1, question: "What 3 distinct positive whole numbers give the exact same answer whether they are added together or multiplied together?", answer: "1, 2, and 3", reward: 300 },
    { tierNumber: 1, question: "Pointing to a photo, a man says, \"I have no siblings, but that man's father is my father's son.\" Who is in the photo?", answer: "His son", reward: 300 },
    { tierNumber: 1, question: "What is the probability of rolling a sum of 7 when rolling two standard 6-sided dice?", answer: "1/6 (or 16.67%)", reward: 300 },
    { tierNumber: 1, question: "A 3x3x3 cube painted red on all outer surfaces is cut into 27 smaller 1x1x1 cubes. How many small cubes have EXACTLY 2 red faces?", answer: "12 Cubes", reward: 300 },
    { tierNumber: 1, question: "What is the next number in the sequence: 3, 5, 9, 17, 33, ___?", answer: "65", reward: 300 },
    { tierNumber: 1, question: "You walk 10 meters South, turn Left and walk 10 meters, then turn Left again and walk 10 meters. How far are you from your starting point?", answer: "10 meters East", reward: 300 },
    { tierNumber: 1, question: "In a class of 50 students, 30 play cricket, 25 play football, and 10 play both. How many students play neither sport?", answer: "5 students", reward: 300 },
    { tierNumber: 1, question: "If 4 workers can build a wall in 4 days, how many days will it take 2 workers to build the exact same wall?", answer: "8 days", reward: 300 },
    { tierNumber: 1, question: "You have 9 identical coins, but 1 is counterfeit and slightly lighter. What is the minimum number of weighings on a balance scale to guarantee finding it?", answer: "2 weighings", reward: 300 },
    { tierNumber: 1, question: "What is the next letter in the sequence: A, C, F, J, O, ___?", answer: "U", reward: 300 },
    { tierNumber: 1, question: "How many 2-digit numbers can be formed using the digits 1, 2, 3, and 4 without repeating any digit?", answer: "12", reward: 300 },
    { tierNumber: 1, question: "What letter comes next in the sequence: Z, X, V, T, R, ___?", answer: "P", reward: 300 },
    { tierNumber: 1, question: "A 12-rung ladder hangs over the side of a boat with rungs spaced 1 foot apart. The tide rises at 2 feet per hour. How many rungs are underwater after 3 hours?", answer: "0 rungs", reward: 300 },
    { tierNumber: 1, question: "Which number does NOT belong in the set: 2, 3, 5, 7, 9, 11, 13?", answer: "9", reward: 300 },
    { tierNumber: 1, question: "What is the next term in the cubic sequence: 1, 8, 27, 64, 125, __?", answer: "216", reward: 300 },
    { tierNumber: 1, question: "How many times in a 12-hour period do the hour and minute hands of an analog clock overlap?", answer: "11 times", reward: 300 },
    { tierNumber: 1, question: "If \"CAT\" is coded as 24 and \"DOG\" is coded as 26 (using A=1, B=2...), what is the numerical value of \"PIG\"?", answer: "32", reward: 300 },
    { tierNumber: 1, question: "If all Bloops are Razzies, and all Razzies are Lazzies, are all Bloops definitely Lazzies?", answer: "Yes", reward: 300 },
    { tierNumber: 1, question: "What is the next number in the pattern based on English word length: 3, 3, 5, 4, 4, 3, 5, 5, 4, ___?", answer: "3", reward: 300 },
    { tierNumber: 1, question: "Two fair coins are flipped. What is the probability that at least one lands on Heads?", answer: "75% (or 3/4)", reward: 300 },
    { tierNumber: 1, question: "What is the 10th term in the doubling sequence: 2, 4, 8, 16, 32... ?", answer: "1024", reward: 300 },
    { tierNumber: 1, question: "A father and son are in a car crash. The father dies. The son is rushed to surgery. The surgeon looks at the boy and says, \"I cannot operate, he is my son!\" Who is the surgeon?", answer: "His mother", reward: 300 },
    { tierNumber: 1, question: "What is the product of all numbers on a standard telephone keypad (0 through 9)?", answer: "0", reward: 300 },

    // Tier 2 Questions (40 Questions)
    { tierNumber: 2, question: "Find the next number: 3, 8, 15, 24, 35, ?", answer: "48", reward: 200 },
    { tierNumber: 2, question: "Find the next number: 2, 6, 12, 20, 30, ?", answer: "42", reward: 200 },
    { tierNumber: 2, question: "8 : 64 :: 12 : ?", answer: "144", reward: 200 },
    { tierNumber: 2, question: "7 : 42 :: 9 : ?", answer: "72", reward: 200 },
    { tierNumber: 2, question: "Find the next letter: B, E, I, N, T, ?", answer: "A", reward: 200 },
    { tierNumber: 2, question: "Find the next letter: Z, W, S, N, H, ?", answer: "A", reward: 200 },
    { tierNumber: 2, question: "I am an odd number. Take away one letter and I become even. What am I?", answer: "Seven", reward: 200 },
    { tierNumber: 2, question: "The more you take from me, the bigger I become. What am I?", answer: "A hole", reward: 200 },
    { tierNumber: 2, question: "I have keys but no locks, I have space but no room, and you can enter but can't go inside. What am I?", answer: "Keyboard", reward: 200 },
    { tierNumber: 2, question: "What has cities, roads and rivers but no people, cars or water?", answer: "Map", reward: 200 },
    { tierNumber: 2, question: "64, 81, 100, 121, 143 — which does not belong?", answer: "143", reward: 200 },
    { tierNumber: 2, question: "3, 5, 11, 17, 23, 27 — which does not belong?", answer: "27", reward: 200 },
    { tierNumber: 2, question: "If CAT = 24 and DOG = 26, using A=1, B=2...Z=26, what is BIRD?", answer: "33", reward: 200 },
    { tierNumber: 2, question: "If APPLE is coded as BQQMF, how is GRAPE coded?", answer: "HSBQF", reward: 200 },
    { tierNumber: 2, question: "Find the missing number: 4, 9, 19, 39, 79, ?", answer: "159", reward: 200 },
    { tierNumber: 2, question: "Find the missing number: 81, 27, 9, 3, ?", answer: "1", reward: 200 },
    { tierNumber: 2, question: "All roses are flowers. Some flowers fade quickly. Can we conclude that some roses fade quickly?", answer: "No", reward: 200 },
    { tierNumber: 2, question: "All A are B. All B are C. Therefore, all A are C. Is the statement logically valid?", answer: "Yes", reward: 200 },
    { tierNumber: 2, question: "A father is 3 times as old as his son. In 12 years, he will be twice as old as his son. How old is the son now?", answer: "12 years", reward: 200 },
    { tierNumber: 2, question: "A is 5 years older than B. B is twice as old as C. If C is 7, how old is A?", answer: "19 years", reward: 200 },
    { tierNumber: 2, question: "Five people A, B, C, D and E stand in a line. A is left of B, C is right of B, D is left of A, and E is right of C. Who is in the middle?", answer: "B", reward: 200 },
    { tierNumber: 2, question: "P, Q, R, S and T sit in a row. Q is immediately right of P. R is immediately left of T. S is between Q and R. Who sits in the middle?", answer: "S", reward: 200 },
    { tierNumber: 2, question: "You walk 5 m north, then 5 m east, then 5 m south. How far are you from your starting point?", answer: "5 m", reward: 200 },
    { tierNumber: 2, question: "A person walks 10 m east, turns left and walks 5 m, then turns left and walks 10 m. Which direction is the person facing?", answer: "West", reward: 200 },
    { tierNumber: 2, question: "What is the angle between the hour and minute hands at exactly 3:30?", answer: "75°", reward: 200 },
    { tierNumber: 2, question: "What is the angle between the hour and minute hands at exactly 6:00?", answer: "180°", reward: 200 },
    { tierNumber: 2, question: "If 5 machines make 5 items in 5 minutes, how many machines are needed to make 100 items in 100 minutes?", answer: "5", reward: 200 },
    { tierNumber: 2, question: "A clock loses 10 minutes every hour. If it is set correctly at 12:00, what will it show after 6 real hours?", answer: "5:00", reward: 200 },
    { tierNumber: 2, question: "Find the missing number: 2, 3, 5, 8, 12, 17, ?", answer: "23", reward: 200 },
    { tierNumber: 2, question: "Find the missing number: 1, 4, 10, 22, 46, ?", answer: "94", reward: 200 },
    { tierNumber: 2, question: "If all ZIPS are ZAPS, and no ZAPS are ZOPS, can any ZIP be a ZOP?", answer: "No", reward: 200 },
    { tierNumber: 2, question: "Rearrange the letters CIFAIPC to form the name of a geographical feature.", answer: "PACIFIC", reward: 200 },
    { tierNumber: 2, question: "In a race, you overtake the person in 2nd place. What position are you now in?", answer: "2nd", reward: 200 },
    { tierNumber: 2, question: "There are 30 students in a class. Rahul ranks 12th from the top. What is his rank from the bottom?", answer: "19th", reward: 200 },
    { tierNumber: 2, question: "3 + 4 = 21, 5 + 2 = 21, 6 + 3 = 45. Then 7 + 4 = ?", answer: "77", reward: 200 },
    { tierNumber: 2, question: "2 × 3 = 8, 3 × 4 = 15, 4 × 5 = 24. Then 5 × 6 = ?", answer: "35", reward: 200 },
    { tierNumber: 2, question: "Three boxes are labelled Apples, Oranges and Mixed. Every label is wrong. You may pick one fruit from one box. Which box should you pick from first?", answer: "Mixed", reward: 200 },
    { tierNumber: 2, question: "A man looks at a photograph and says: \"Brothers and sisters, I have none. But that man's father is my father's son.\" Who is in the photograph?", answer: "His son", reward: 200 },
    { tierNumber: 2, question: "What comes next? Monday, Wednesday, Saturday, Wednesday, Monday, ?", answer: "Saturday", reward: 200 },
    { tierNumber: 2, question: "A number is multiplied by 3 and then 6 is added. The result is 30. What is the number?", answer: "8", reward: 200 },

    // Tier 3 Questions (40 Questions) - Easy ($100 reward)
    { tierNumber: 3, question: "How many months in a year have 28 days?", answer: "12", reward: 100 },
    { tierNumber: 3, question: "What goes up when rain comes down?", answer: "Umbrella", reward: 100 },
    { tierNumber: 3, question: "What has hands but cannot clap?", answer: "Clock", reward: 100 },
    { tierNumber: 3, question: "What belongs to you, but other people use it more than you do?", answer: "Name", reward: 100 },
    { tierNumber: 3, question: "What has a head and a tail, but no body?", answer: "Coin", reward: 100 },
    { tierNumber: 3, question: "If you have 3 apples and you take away 2, how many apples do you have?", answer: "2", reward: 100 },
    { tierNumber: 3, question: "What gets wetter the more it dries?", answer: "Towel", reward: 100 },
    { tierNumber: 3, question: "What can you break, even if you never pick it up or touch it?", answer: "Promise", reward: 100 },
    { tierNumber: 3, question: "What key cannot open any door?", answer: "Donkey", reward: 100 },
    { tierNumber: 3, question: "What has many keys but can't open a single lock?", answer: "Piano", reward: 100 },
    { tierNumber: 3, question: "What goes up but never comes down?", answer: "Age", reward: 100 },
    { tierNumber: 3, question: "If a red house is made of red bricks, and a blue house is made of blue bricks, what is a greenhouse made of?", answer: "Glass", reward: 100 },
    { tierNumber: 3, question: "What has words, but never speaks?", answer: "Book", reward: 100 },
    { tierNumber: 3, question: "What runs all around the backyard, yet never moves?", answer: "Fence", reward: 100 },
    { tierNumber: 3, question: "What has legs, but doesn't walk?", answer: "Table", reward: 100 },
    { tierNumber: 3, question: "What travels around the world while staying in a corner?", answer: "Stamp", reward: 100 },
    { tierNumber: 3, question: "What has a neck but no head?", answer: "Bottle", reward: 100 },
    { tierNumber: 3, question: "What can you catch, but not throw?", answer: "Cold", reward: 100 },
    { tierNumber: 3, question: "What is full of holes but still holds water?", answer: "Sponge", reward: 100 },
    { tierNumber: 3, question: "What gets bigger the more you take away from it?", answer: "Hole", reward: 100 },
    { tierNumber: 3, question: "How many sides does a circle have?", answer: "2", reward: 100 },
    { tierNumber: 3, question: "What has one eye, but can't see?", answer: "Needle", reward: 100 },
    { tierNumber: 3, question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "M", reward: 100 },
    { tierNumber: 3, question: "Which is heavier: 1 kg of feathers or 1 kg of iron?", answer: "Equal", reward: 100 },
    { tierNumber: 3, question: "What has a thumb and four fingers, but is not a living thing?", answer: "Glove", reward: 100 },
    { tierNumber: 3, question: "If an electric train is traveling south, which way does the smoke blow?", answer: "None", reward: 100 },
    { tierNumber: 3, question: "What has teeth but cannot bite?", answer: "Comb", reward: 100 },
    { tierNumber: 3, question: "What color is a black box on a commercial airplane?", answer: "Orange", reward: 100 },
    { tierNumber: 3, question: "What builds up when you don't clean your room, but disappears when you sweep?", answer: "Dust", reward: 100 },
    { tierNumber: 3, question: "What has a face and two hands, but no arms or legs?", answer: "Clock", reward: 100 },
    { tierNumber: 3, question: "If you freeze water, what do you get?", answer: "Ice", reward: 100 },
    { tierNumber: 3, question: "What is always in front of you but can't be seen?", answer: "Future", reward: 100 },
    { tierNumber: 3, question: "What has a bottom at the top?", answer: "Legs", reward: 100 },
    { tierNumber: 3, question: "If a plane crashes directly on the border of the US and Canada, where do you bury the survivors?", answer: "Nowhere", reward: 100 },
    { tierNumber: 3, question: "What ends everything?", answer: "G", reward: 100 },
    { tierNumber: 3, question: "What can you hold in your left hand, but never in your right hand?", answer: "Elbow", reward: 100 },
    { tierNumber: 3, question: "What ring is square?", answer: "Boxing", reward: 100 },
    { tierNumber: 3, question: "What basic digit increases in value when turned upside down?", answer: "6", reward: 100 },
    { tierNumber: 3, question: "What kind of band never plays music?", answer: "Rubber", reward: 100 },
    { tierNumber: 3, question: "What has many needle points, but doesn't sew?", answer: "Cactus", reward: 100 },
  ];

  // Remove earlier Tier 1, Tier 2 & Tier 3 questions before re-seeding
  const tier1Id = seededTiers[1];
  if (tier1Id) {
    await db.delete(questions).where(eq(questions.tierId, tier1Id));
    console.log("✓ Cleared previous Tier 1 questions");
  }

  const tier2Id = seededTiers[2];
  if (tier2Id) {
    await db.delete(questions).where(eq(questions.tierId, tier2Id));
    console.log("✓ Cleared previous Tier 2 questions");
  }

  const tier3Id = seededTiers[3];
  if (tier3Id) {
    await db.delete(questions).where(eq(questions.tierId, tier3Id));
    console.log("✓ Cleared previous Tier 3 questions");
  }

  const existingQuestions = await db.select({ question: questions.question }).from(questions);
  const existingSet = new Set(existingQuestions.map((q) => q.question));

  const questionsToInsert = questionData
    .filter((q) => !existingSet.has(q.question))
    .map((q) => ({
      tierId: seededTiers[q.tierNumber],
      question: q.question,
      answer: q.answer,
      reward: q.reward,
    }));

  if (questionsToInsert.length > 0) {
    await db.insert(questions).values(questionsToInsert);
    console.log(`+ Inserted ${questionsToInsert.length} questions into DB`);
  }

  // 38 Football Players Catalog Seed Data (Calibrated so max earnings from solving questions can buy only 7 players)
  const playerData = [
    // Tier 1 Strikers ($3,400 - $4,200)
    { tierNumber: 1, position: "Striker", playerName: "Cristiano Ronaldo", price: 3600, speed: 85, physical: 90, technique: 88, stamina: 78, precision: 85, defense: 35, pros: "Goal Machine", cons: "Not a team player", overallScore: 92 },
    { tierNumber: 1, position: "Striker", playerName: "Kylian Mbappe", price: 4200, speed: 97, physical: 84, technique: 90, stamina: 85, precision: 89, defense: 38, pros: "Lightning Fast", cons: "Doesn't Pass Much", overallScore: 94 },
    { tierNumber: 1, position: "Striker", playerName: "Erling Haaland", price: 3950, speed: 89, physical: 94, technique: 80, stamina: 82, precision: 91, defense: 42, pros: "Pure Power", cons: "Weak Ball Control", overallScore: 93 },
    { tierNumber: 1, position: "Striker", playerName: "Lionel Messi", price: 4100, speed: 90, physical: 85, technique: 97, stamina: 80, precision: 97, defense: 37, pros: "Pure Magic", cons: "Gets Tired Fast", overallScore: 95 },
    { tierNumber: 1, position: "Striker", playerName: "Harry Kane", price: 3500, speed: 70, physical: 85, technique: 88, stamina: 84, precision: 93, defense: 48, pros: "Deadly Shooter", cons: "Very Slow", overallScore: 92 },
    { tierNumber: 1, position: "Striker", playerName: "Vinicius Junior", price: 3400, speed: 95, physical: 78, technique: 92, stamina: 86, precision: 85, defense: 40, pros: "Amazing Dribbler", cons: "Misses Easy Shots", overallScore: 91 },

    // Tier 1 Midfielders ($2,900 - $3,800)
    { tierNumber: 1, position: "Midfielder", playerName: "Kevin De Bruyne", price: 3700, speed: 75, physical: 78, technique: 94, stamina: 83, precision: 95, defense: 68, pros: "Perfect Passer", cons: "Gets Hurt Easily", overallScore: 92 },
    { tierNumber: 1, position: "Midfielder", playerName: "Jude Bellingham", price: 3800, speed: 82, physical: 85, technique: 88, stamina: 92, precision: 86, defense: 84, pros: "Does Everything", cons: "Gets Angry Easily", overallScore: 91 },
    { tierNumber: 1, position: "Midfielder", playerName: "Rodri", price: 3750, speed: 65, physical: 86, technique: 89, stamina: 90, precision: 87, defense: 92, pros: "Steals Every Ball", cons: "Slow Runner", overallScore: 91 },
    { tierNumber: 1, position: "Midfielder", playerName: "Martin Odegaard", price: 3100, speed: 78, physical: 72, technique: 90, stamina: 89, precision: 90, defense: 65, pros: "Super Creative", cons: "Only Uses Left Foot", overallScore: 89 },
    { tierNumber: 1, position: "Midfielder", playerName: "Luka Modric", price: 2900, speed: 72, physical: 65, technique: 92, stamina: 75, precision: 91, defense: 72, pros: "Super Smart", cons: "Gets Tired Fast", overallScore: 88 },

    // Tier 1 Defenders ($2,800 - $3,550)
    { tierNumber: 1, position: "Defender", playerName: "Virgil van Dijk", price: 3550, speed: 78, physical: 93, technique: 75, stamina: 84, precision: 80, defense: 92, pros: "Unstoppable Wall", cons: "Too Relaxed", overallScore: 91 },
    { tierNumber: 1, position: "Defender", playerName: "Ruben Dias", price: 3300, speed: 65, physical: 90, technique: 70, stamina: 87, precision: 75, defense: 90, pros: "Blocks Everything", cons: "Average Speed", overallScore: 90 },
    { tierNumber: 1, position: "Defender", playerName: "Antonio Rudiger", price: 3100, speed: 85, physical: 88, technique: 68, stamina: 88, precision: 72, defense: 89, pros: "Scary & Fast", cons: "Makes Bad Fouls", overallScore: 89 },
    { tierNumber: 1, position: "Defender", playerName: "Trent Alexander-Arnold", price: 2950, speed: 78, physical: 75, technique: 90, stamina: 89, precision: 93, defense: 75, pros: "Amazing Kicks", cons: "Bad at Defending", overallScore: 88 },
    { tierNumber: 1, position: "Defender", playerName: "Alphonso Davies", price: 2800, speed: 95, physical: 76, technique: 82, stamina: 90, precision: 78, defense: 78, pros: "Super Fast", cons: "Forgets to Defend", overallScore: 87 },

    // Tier 1 Goalkeepers ($2,900 - $3,200)
    { tierNumber: 1, position: "Goalkeeper", playerName: "Alisson Becker", price: 3200, speed: 50, physical: 85, technique: 88, stamina: 70, precision: 85, defense: 90, pros: "Saves Everything", cons: "Takes Risky Passes", overallScore: 90 },
    { tierNumber: 1, position: "Goalkeeper", playerName: "Thibaut Courtois", price: 3200, speed: 45, physical: 80, technique: 75, stamina: 65, precision: 82, defense: 89, pros: "Super Tall", cons: "Slow on Ground", overallScore: 90 },
    { tierNumber: 1, position: "Goalkeeper", playerName: "Ederson", price: 2900, speed: 55, physical: 75, technique: 92, stamina: 75, precision: 90, defense: 86, pros: "Passes Like Striker", cons: "Weak Long Saves", overallScore: 89 },

    // Tier 2 Strikers ($2,500 - $3,100)
    { tierNumber: 2, position: "Striker", playerName: "Bukayo Saka", price: 2850, speed: 86, physical: 75, technique: 87, stamina: 88, precision: 85, defense: 62, pros: "Very Reliable", cons: "Gets Tired", overallScore: 88 },
    { tierNumber: 2, position: "Striker", playerName: "Mohamed Salah", price: 3100, speed: 88, physical: 80, technique: 88, stamina: 85, precision: 89, defense: 45, pros: "Great Scorer", cons: "Losing Speed", overallScore: 89 },
    { tierNumber: 2, position: "Striker", playerName: "Victor Osimhen", price: 2750, speed: 90, physical: 85, technique: 78, stamina: 84, precision: 82, defense: 40, pros: "Jumps So High", cons: "Gets Hurt Easily", overallScore: 88 },
    { tierNumber: 2, position: "Striker", playerName: "Heung-Min Son", price: 2750, speed: 87, physical: 75, technique: 86, stamina: 86, precision: 90, defense: 50, pros: "Scores Both Feet", cons: "Has Bad Days", overallScore: 88 },
    { tierNumber: 2, position: "Striker", playerName: "Rafael Leao", price: 2500, speed: 93, physical: 82, technique: 85, stamina: 79, precision: 81, defense: 35, pros: "Super Explosive", cons: "Gets Lazy", overallScore: 87 },

    // Tier 2 Midfielders ($2,450 - $3,000)
    { tierNumber: 2, position: "Midfielder", playerName: "Declan Rice", price: 2800, speed: 75, physical: 85, technique: 82, stamina: 95, precision: 80, defense: 88, pros: "Non-Stop Running", cons: "Simple Passes", overallScore: 88 },
    { tierNumber: 2, position: "Midfielder", playerName: "Bruno Fernandes", price: 2800, speed: 78, physical: 75, technique: 88, stamina: 94, precision: 88, defense: 68, pros: "Creates Goals", cons: "Loses Ball Often", overallScore: 88 },
    { tierNumber: 2, position: "Midfielder", playerName: "Federico Valverde", price: 3000, speed: 92, physical: 82, technique: 85, stamina: 96, precision: 84, defense: 82, pros: "Infinite Energy", cons: "Clumsy Control", overallScore: 89 },
    { tierNumber: 2, position: "Midfielder", playerName: "Jamal Musiala", price: 2700, speed: 85, physical: 70, technique: 91, stamina: 84, precision: 83, defense: 55, pros: "Tricky Dribbler", cons: "Weak Shots", overallScore: 88 },
    { tierNumber: 2, position: "Midfielder", playerName: "Pedri", price: 2450, speed: 78, physical: 65, technique: 90, stamina: 82, precision: 89, defense: 68, pros: "Never Loses Ball", cons: "Gets Hurt Easily", overallScore: 87 },

    // Tier 2 Defenders ($2,200 - $2,700)
    { tierNumber: 2, position: "Defender", playerName: "William Saliba", price: 2700, speed: 82, physical: 85, technique: 75, stamina: 84, precision: 78, defense: 88, pros: "Super Calm", cons: "Lacks Experience", overallScore: 88 },
    { tierNumber: 2, position: "Defender", playerName: "John Stones", price: 2400, speed: 72, physical: 80, technique: 84, stamina: 80, precision: 83, defense: 86, pros: "Good with Ball", cons: "Gets Hurt Easily", overallScore: 87 },
    { tierNumber: 2, position: "Defender", playerName: "Kyle Walker", price: 2200, speed: 92, physical: 85, technique: 70, stamina: 88, precision: 72, defense: 85, pros: "Catches Anyone", cons: "Getting Old", overallScore: 86 },
    { tierNumber: 2, position: "Defender", playerName: "Theo Hernandez", price: 2400, speed: 94, physical: 82, technique: 78, stamina: 89, precision: 80, defense: 78, pros: "Scores Goals", cons: "Leaves Big Gaps", overallScore: 87 },
    { tierNumber: 2, position: "Defender", playerName: "Marquinhos", price: 2400, speed: 78, physical: 84, technique: 76, stamina: 85, precision: 75, defense: 87, pros: "Great Leader", cons: "Short for Defender", overallScore: 87 },

    // Tier 2 Goalkeepers ($2,300 - $2,700)
    { tierNumber: 2, position: "Goalkeeper", playerName: "Marc-Andre ter Stegen", price: 2700, speed: 50, physical: 75, technique: 85, stamina: 70, precision: 84, defense: 86, pros: "Quick Reflexes", cons: "Makes Big Mistakes", overallScore: 88 },
    { tierNumber: 2, position: "Goalkeeper", playerName: "Emiliano Martinez", price: 2300, speed: 55, physical: 85, technique: 70, stamina: 75, precision: 78, defense: 85, pros: "Penalty Master", cons: "Acts Crazy", overallScore: 87 },
    { tierNumber: 2, position: "Goalkeeper", playerName: "Mike Maignan", price: 2700, speed: 60, physical: 82, technique: 80, stamina: 72, precision: 80, defense: 85, pros: "Super Agile", cons: "Gets Hurt Easily", overallScore: 88 },

    // Tier 3 Strikers ($1,400 - $1,700)
    { tierNumber: 3, position: "Striker", playerName: "Ollie Watkins", price: 1550, speed: 85, physical: 80, technique: 78, stamina: 88, precision: 83, defense: 52, pros: "Hard Worker", cons: "Not Fancy", overallScore: 86 },
    { tierNumber: 3, position: "Striker", playerName: "Alexander Isak", price: 1550, speed: 88, physical: 78, technique: 84, stamina: 80, precision: 85, defense: 38, pros: "Tall & Quick", cons: "Gets Hurt Easily", overallScore: 86 },
    { tierNumber: 3, position: "Striker", playerName: "Julian Alvarez", price: 1700, speed: 84, physical: 78, technique: 82, stamina: 91, precision: 84, defense: 58, pros: "Chases Everyone", cons: "Wrong Position", overallScore: 86 },
    { tierNumber: 3, position: "Striker", playerName: "Raphinha", price: 1400, speed: 86, physical: 75, technique: 83, stamina: 92, precision: 82, defense: 55, pros: "Runs All Game", cons: "Predictable", overallScore: 85 },
    { tierNumber: 3, position: "Striker", playerName: "Marcus Rashford", price: 1400, speed: 90, physical: 78, technique: 82, stamina: 78, precision: 83, defense: 42, pros: "Fast Counter", cons: "Very Inconsistent", overallScore: 85 },

    // Tier 3 Midfielders ($950 - $1,400)
    { tierNumber: 3, position: "Midfielder", playerName: "Enzo Fernandez", price: 1400, speed: 70, physical: 75, technique: 86, stamina: 85, precision: 87, defense: 78, pros: "Long Passes", cons: "Slow Runner", overallScore: 85 },
    { tierNumber: 3, position: "Midfielder", playerName: "Dominik Szoboszlai", price: 1400, speed: 82, physical: 78, technique: 84, stamina: 88, precision: 86, defense: 70, pros: "Powerful Shots", cons: "Still Learning", overallScore: 85 },
    { tierNumber: 3, position: "Midfielder", playerName: "Alexis Mac Allister", price: 1400, speed: 72, physical: 75, technique: 85, stamina: 86, precision: 86, defense: 80, pros: "Very Neat", cons: "Not Strong", overallScore: 85 },
    { tierNumber: 3, position: "Midfielder", playerName: "Gavi", price: 950, speed: 78, physical: 70, technique: 82, stamina: 93, precision: 78, defense: 76, pros: "Fights Hard", cons: "Gets Red Cards", overallScore: 84 },
    { tierNumber: 3, position: "Midfielder", playerName: "Eduardo Camavinga", price: 1400, speed: 82, physical: 78, technique: 84, stamina: 89, precision: 81, defense: 84, pros: "Super Energetic", cons: "Loses Focus", overallScore: 85 },

    // Tier 3 Defenders ($950 - $1,550)
    { tierNumber: 3, position: "Defender", playerName: "Gabriel Magalhaes", price: 1550, speed: 75, physical: 88, technique: 70, stamina: 84, precision: 75, defense: 86, pros: "Scores Corners", cons: "Angry Easily", overallScore: 86 },
    { tierNumber: 3, position: "Defender", playerName: "Lisandro Martinez", price: 1200, speed: 76, physical: 85, technique: 82, stamina: 83, precision: 80, defense: 85, pros: "Tough Tackler", cons: "Very Short", overallScore: 85 },
    { tierNumber: 3, position: "Defender", playerName: "Manuel Akanji", price: 1200, speed: 80, physical: 82, technique: 75, stamina: 82, precision: 76, defense: 84, pros: "Plays Anywhere", cons: "Makes Mistakes", overallScore: 85 },
    { tierNumber: 3, position: "Defender", playerName: "Jeremie Frimpong", price: 1400, speed: 95, physical: 70, technique: 80, stamina: 91, precision: 82, defense: 72, pros: "Crazy Speed", cons: "Weak Defender", overallScore: 85 },
    { tierNumber: 3, position: "Defender", playerName: "Nathan Ake", price: 950, speed: 76, physical: 82, technique: 75, stamina: 80, precision: 76, defense: 84, pros: "Very Safe", cons: "Not Flashy", overallScore: 84 },

    // Tier 3 Goalkeepers ($800 - $1,200)
    { tierNumber: 3, position: "Goalkeeper", playerName: "Jordan Pickford", price: 950, speed: 55, physical: 80, technique: 84, stamina: 75, precision: 82, defense: 82, pros: "Kicks Far", cons: "Gets Nervous", overallScore: 84 },
    { tierNumber: 3, position: "Goalkeeper", playerName: "David Raya", price: 1200, speed: 55, physical: 75, technique: 85, stamina: 72, precision: 83, defense: 83, pros: "Safe Hands", cons: "Short Height", overallScore: 85 },
    { tierNumber: 3, position: "Goalkeeper", playerName: "Guglielmo Vicario", price: 800, speed: 60, physical: 78, technique: 75, stamina: 74, precision: 77, defense: 82, pros: "Great Shot Saver", cons: "Not Famous Yet", overallScore: 84 },
  ];

  const existingPlayers = await db.select({ id: players.id, playerName: players.playerName }).from(players);
  const playerMap = new Map(existingPlayers.map((p) => [p.playerName, p.id]));

  const playersToInsert = [];
  let updatedCount = 0;

  for (const p of playerData) {
    const existingId = playerMap.get(p.playerName);
    if (existingId) {
      await db
        .update(players)
        .set({
          price: p.price,
          tierNumber: p.tierNumber,
          position: p.position,
          speed: p.speed,
          physical: p.physical,
          technique: p.technique,
          stamina: p.stamina,
          precision: p.precision,
          defense: p.defense,
          pros: p.pros,
          cons: p.cons,
          overallScore: p.overallScore,
        })
        .where(eq(players.id, existingId));
      updatedCount++;
    } else {
      playersToInsert.push(p);
    }
  }

  if (playersToInsert.length > 0) {
    await db.insert(players).values(playersToInsert);
    console.log(`+ Inserted ${playersToInsert.length} new players into DB`);
  }
  console.log(`✓ Updated ${updatedCount} existing players with calibrated pricing in DB`);

  console.log("✅ Seed completed successfully!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

