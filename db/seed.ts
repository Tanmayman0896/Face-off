import { db } from "./index";
import { tiers, questions, players } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting database seed...");

  const tierData = [
    {
      tierNumber: 1,
      name: "Tier 1",
      description: "Novice Tier - Basic web technology and programming fundamentals.",
    },
    {
      tierNumber: 2,
      name: "Tier 2",
      description: "Pro Tier - Intermediate web development and computer science concepts.",
    },
    {
      tierNumber: 3,
      name: "Tier 3",
      description: "Master Tier - Advanced system design, algorithms, and architecture.",
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
      console.log(`✓ Tier ${t.tierNumber} already exists (${existing[0].id})`);
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
    // Tier 1 Questions
    {
      tierNumber: 1,
      question: "What is the primary language used for styling web pages?",
      answer: "CSS",
      reward: 100,
    },
    {
      tierNumber: 1,
      question: "What does HTML stand for?",
      answer: "HyperText Markup Language",
      reward: 150,
    },
    {
      tierNumber: 1,
      question: "Which keyword is used to declare a constant variable in JavaScript?",
      answer: "const",
      reward: 200,
    },

    // Tier 2 Questions
    {
      tierNumber: 2,
      question: "What JavaScript method converts a JSON string into an object?",
      answer: "JSON.parse",
      reward: 250,
    },
    {
      tierNumber: 2,
      question: "What HTTP status code represents 'Not Found'?",
      answer: "404",
      reward: 300,
    },
    {
      tierNumber: 2,
      question: "Which data structure uses LIFO (Last In, First Out) ordering?",
      answer: "Stack",
      reward: 350,
    },

    // Tier 3 Questions
    {
      tierNumber: 3,
      question: "What design pattern restricts a class to a single instance?",
      answer: "Singleton",
      reward: 500,
    },
    {
      tierNumber: 3,
      question: "In database transactions, what does ACID stand for?",
      answer: "Atomicity Consistency Isolation Durability",
      reward: 600,
    },
    {
      tierNumber: 3,
      question: "What is the time complexity of binary search on a sorted array of size n?",
      answer: "O(log n)",
      reward: 750,
    },
  ];

  for (const q of questionData) {
    const tierId = seededTiers[q.tierNumber];
    const existing = await db
      .select()
      .from(questions)
      .where(eq(questions.question, q.question));

    if (existing.length > 0) {
      console.log(`✓ Question "${q.question.slice(0, 30)}..." already exists`);
    } else {
      await db.insert(questions).values({
        tierId,
        question: q.question,
        answer: q.answer,
        reward: q.reward,
      });
      console.log(`+ Inserted Question for Tier ${q.tierNumber} ($${q.reward})`);
    }
  }

  // 38 Football Players Catalog Seed Data (Calibrated so $3,200 earnings can form a 7-player squad)
  const playerData = [
    // Tier 1 Strikers ($500 - $700)
    { tierNumber: 1, position: "Striker", playerName: "Cristiano Ronaldo", price: 530, speed: 85, physical: 90, technique: 88, stamina: 78, precision: 85, defense: 35, pros: "Goal Machine", cons: "Not a team player", overallScore: 92 },
    { tierNumber: 1, position: "Striker", playerName: "Kylian Mbappe", price: 700, speed: 97, physical: 84, technique: 90, stamina: 85, precision: 89, defense: 38, pros: "Lightning Fast", cons: "Doesn't Pass Much", overallScore: 94 },
    { tierNumber: 1, position: "Striker", playerName: "Erling Haaland", price: 670, speed: 89, physical: 94, technique: 80, stamina: 82, precision: 91, defense: 42, pros: "Pure Power", cons: "Weak Ball Control", overallScore: 93 },
    { tierNumber: 1, position: "Striker", playerName: "Lionel Messi", price: 650, speed: 90, physical: 85, technique: 97, stamina: 80, precision: 97, defense: 37, pros: "Pure Magic", cons: "Gets Tired Fast", overallScore: 95 },
    { tierNumber: 1, position: "Striker", playerName: "Harry Kane", price: 550, speed: 70, physical: 85, technique: 88, stamina: 84, precision: 93, defense: 48, pros: "Deadly Shooter", cons: "Very Slow", overallScore: 92 },
    { tierNumber: 1, position: "Striker", playerName: "Vinicius Junior", price: 500, speed: 95, physical: 78, technique: 92, stamina: 86, precision: 85, defense: 40, pros: "Amazing Dribbler", cons: "Misses Easy Shots", overallScore: 91 },

    // Tier 1 Midfielders ($380 - $620)
    { tierNumber: 1, position: "Midfielder", playerName: "Kevin De Bruyne", price: 580, speed: 75, physical: 78, technique: 94, stamina: 83, precision: 95, defense: 68, pros: "Perfect Passer", cons: "Gets Hurt Easily", overallScore: 92 },
    { tierNumber: 1, position: "Midfielder", playerName: "Jude Bellingham", price: 620, speed: 82, physical: 85, technique: 88, stamina: 92, precision: 86, defense: 84, pros: "Does Everything", cons: "Gets Angry Easily", overallScore: 91 },
    { tierNumber: 1, position: "Midfielder", playerName: "Rodri", price: 600, speed: 65, physical: 86, technique: 89, stamina: 90, precision: 87, defense: 92, pros: "Steals Every Ball", cons: "Slow Runner", overallScore: 91 },
    { tierNumber: 1, position: "Midfielder", playerName: "Martin Odegaard", price: 420, speed: 78, physical: 72, technique: 90, stamina: 89, precision: 90, defense: 65, pros: "Super Creative", cons: "Only Uses Left Foot", overallScore: 89 },
    { tierNumber: 1, position: "Midfielder", playerName: "Luka Modric", price: 380, speed: 72, physical: 65, technique: 92, stamina: 75, precision: 91, defense: 72, pros: "Super Smart", cons: "Gets Tired Fast", overallScore: 88 },

    // Tier 1 Defenders ($360 - $520)
    { tierNumber: 1, position: "Defender", playerName: "Virgil van Dijk", price: 520, speed: 78, physical: 93, technique: 75, stamina: 84, precision: 80, defense: 92, pros: "Unstoppable Wall", cons: "Too Relaxed", overallScore: 91 },
    { tierNumber: 1, position: "Defender", playerName: "Ruben Dias", price: 460, speed: 65, physical: 90, technique: 70, stamina: 87, precision: 75, defense: 90, pros: "Blocks Everything", cons: "Average Speed", overallScore: 90 },
    { tierNumber: 1, position: "Defender", playerName: "Antonio Rudiger", price: 410, speed: 85, physical: 88, technique: 68, stamina: 88, precision: 72, defense: 89, pros: "Scary & Fast", cons: "Makes Bad Fouls", overallScore: 89 },
    { tierNumber: 1, position: "Defender", playerName: "Trent Alexander-Arnold", price: 400, speed: 78, physical: 75, technique: 90, stamina: 89, precision: 93, defense: 75, pros: "Amazing Kicks", cons: "Bad at Defending", overallScore: 88 },
    { tierNumber: 1, position: "Defender", playerName: "Alphonso Davies", price: 360, speed: 95, physical: 76, technique: 82, stamina: 90, precision: 78, defense: 78, pros: "Super Fast", cons: "Forgets to Defend", overallScore: 87 },

    // Tier 1 Goalkeepers ($400 - $440)
    { tierNumber: 1, position: "Goalkeeper", playerName: "Alisson Becker", price: 440, speed: 50, physical: 85, technique: 88, stamina: 70, precision: 85, defense: 90, pros: "Saves Everything", cons: "Takes Risky Passes", overallScore: 90 },
    { tierNumber: 1, position: "Goalkeeper", playerName: "Thibaut Courtois", price: 440, speed: 45, physical: 80, technique: 75, stamina: 65, precision: 82, defense: 89, pros: "Super Tall", cons: "Slow on Ground", overallScore: 90 },
    { tierNumber: 1, position: "Goalkeeper", playerName: "Ederson", price: 400, speed: 55, physical: 75, technique: 92, stamina: 75, precision: 90, defense: 86, pros: "Passes Like Striker", cons: "Weak Long Saves", overallScore: 89 },

    // Tier 2 Strikers ($220 - $300)
    { tierNumber: 2, position: "Striker", playerName: "Bukayo Saka", price: 270, speed: 86, physical: 75, technique: 87, stamina: 88, precision: 85, defense: 62, pros: "Very Reliable", cons: "Gets Tired", overallScore: 88 },
    { tierNumber: 2, position: "Striker", playerName: "Mohamed Salah", price: 300, speed: 88, physical: 80, technique: 88, stamina: 85, precision: 89, defense: 45, pros: "Great Scorer", cons: "Losing Speed", overallScore: 89 },
    { tierNumber: 2, position: "Striker", playerName: "Victor Osimhen", price: 250, speed: 90, physical: 85, technique: 78, stamina: 84, precision: 82, defense: 40, pros: "Jumps So High", cons: "Gets Hurt Easily", overallScore: 88 },
    { tierNumber: 2, position: "Striker", playerName: "Heung-Min Son", price: 250, speed: 87, physical: 75, technique: 86, stamina: 86, precision: 90, defense: 50, pros: "Scores Both Feet", cons: "Has Bad Days", overallScore: 88 },
    { tierNumber: 2, position: "Striker", playerName: "Rafael Leao", price: 220, speed: 93, physical: 82, technique: 85, stamina: 79, precision: 81, defense: 35, pros: "Super Explosive", cons: "Gets Lazy", overallScore: 87 },

    // Tier 2 Midfielders ($220 - $290)
    { tierNumber: 2, position: "Midfielder", playerName: "Declan Rice", price: 260, speed: 75, physical: 85, technique: 82, stamina: 95, precision: 80, defense: 88, pros: "Non-Stop Running", cons: "Simple Passes", overallScore: 88 },
    { tierNumber: 2, position: "Midfielder", playerName: "Bruno Fernandes", price: 260, speed: 78, physical: 75, technique: 88, stamina: 94, precision: 88, defense: 68, pros: "Creates Goals", cons: "Loses Ball Often", overallScore: 88 },
    { tierNumber: 2, position: "Midfielder", playerName: "Federico Valverde", price: 290, speed: 92, physical: 82, technique: 85, stamina: 96, precision: 84, defense: 82, pros: "Infinite Energy", cons: "Clumsy Control", overallScore: 89 },
    { tierNumber: 2, position: "Midfielder", playerName: "Jamal Musiala", price: 250, speed: 85, physical: 70, technique: 91, stamina: 84, precision: 83, defense: 55, pros: "Tricky Dribbler", cons: "Weak Shots", overallScore: 88 },
    { tierNumber: 2, position: "Midfielder", playerName: "Pedri", price: 220, speed: 78, physical: 65, technique: 90, stamina: 82, precision: 89, defense: 68, pros: "Never Loses Ball", cons: "Gets Hurt Easily", overallScore: 87 },

    // Tier 2 Defenders ($170 - $240)
    { tierNumber: 2, position: "Defender", playerName: "William Saliba", price: 240, speed: 82, physical: 85, technique: 75, stamina: 84, precision: 78, defense: 88, pros: "Super Calm", cons: "Lacks Experience", overallScore: 88 },
    { tierNumber: 2, position: "Defender", playerName: "John Stones", price: 200, speed: 72, physical: 80, technique: 84, stamina: 80, precision: 83, defense: 86, pros: "Good with Ball", cons: "Gets Hurt Easily", overallScore: 87 },
    { tierNumber: 2, position: "Defender", playerName: "Kyle Walker", price: 170, speed: 92, physical: 85, technique: 70, stamina: 88, precision: 72, defense: 85, pros: "Catches Anyone", cons: "Getting Old", overallScore: 86 },
    { tierNumber: 2, position: "Defender", playerName: "Theo Hernandez", price: 200, speed: 94, physical: 82, technique: 78, stamina: 89, precision: 80, defense: 78, pros: "Scores Goals", cons: "Leaves Big Gaps", overallScore: 87 },
    { tierNumber: 2, position: "Defender", playerName: "Marquinhos", price: 200, speed: 78, physical: 84, technique: 76, stamina: 85, precision: 75, defense: 87, pros: "Great Leader", cons: "Short for Defender", overallScore: 87 },

    // Tier 2 Goalkeepers ($190 - $240)
    { tierNumber: 2, position: "Goalkeeper", playerName: "Marc-Andre ter Stegen", price: 240, speed: 50, physical: 75, technique: 85, stamina: 70, precision: 84, defense: 86, pros: "Quick Reflexes", cons: "Makes Big Mistakes", overallScore: 88 },
    { tierNumber: 2, position: "Goalkeeper", playerName: "Emiliano Martinez", price: 190, speed: 55, physical: 85, technique: 70, stamina: 75, precision: 78, defense: 85, pros: "Penalty Master", cons: "Acts Crazy", overallScore: 87 },
    { tierNumber: 2, position: "Goalkeeper", playerName: "Mike Maignan", price: 240, speed: 60, physical: 82, technique: 80, stamina: 72, precision: 80, defense: 85, pros: "Super Agile", cons: "Gets Hurt Easily", overallScore: 88 },

    // Tier 3 Strikers ($60 - $80)
    { tierNumber: 3, position: "Striker", playerName: "Ollie Watkins", price: 70, speed: 85, physical: 80, technique: 78, stamina: 88, precision: 83, defense: 52, pros: "Hard Worker", cons: "Not Fancy", overallScore: 86 },
    { tierNumber: 3, position: "Striker", playerName: "Alexander Isak", price: 70, speed: 88, physical: 78, technique: 84, stamina: 80, precision: 85, defense: 38, pros: "Tall & Quick", cons: "Gets Hurt Easily", overallScore: 86 },
    { tierNumber: 3, position: "Striker", playerName: "Julian Alvarez", price: 80, speed: 84, physical: 78, technique: 82, stamina: 91, precision: 84, defense: 58, pros: "Chases Everyone", cons: "Wrong Position", overallScore: 86 },
    { tierNumber: 3, position: "Striker", playerName: "Raphinha", price: 60, speed: 86, physical: 75, technique: 83, stamina: 92, precision: 82, defense: 55, pros: "Runs All Game", cons: "Predictable", overallScore: 85 },
    { tierNumber: 3, position: "Striker", playerName: "Marcus Rashford", price: 60, speed: 90, physical: 78, technique: 82, stamina: 78, precision: 83, defense: 42, pros: "Fast Counter", cons: "Very Inconsistent", overallScore: 85 },

    // Tier 3 Midfielders ($40 - $60)
    { tierNumber: 3, position: "Midfielder", playerName: "Enzo Fernandez", price: 60, speed: 70, physical: 75, technique: 86, stamina: 85, precision: 87, defense: 78, pros: "Long Passes", cons: "Slow Runner", overallScore: 85 },
    { tierNumber: 3, position: "Midfielder", playerName: "Dominik Szoboszlai", price: 60, speed: 82, physical: 78, technique: 84, stamina: 88, precision: 86, defense: 70, pros: "Powerful Shots", cons: "Still Learning", overallScore: 85 },
    { tierNumber: 3, position: "Midfielder", playerName: "Alexis Mac Allister", price: 60, speed: 72, physical: 75, technique: 85, stamina: 86, precision: 86, defense: 80, pros: "Very Neat", cons: "Not Strong", overallScore: 85 },
    { tierNumber: 3, position: "Midfielder", playerName: "Gavi", price: 40, speed: 78, physical: 70, technique: 82, stamina: 93, precision: 78, defense: 76, pros: "Fights Hard", cons: "Gets Red Cards", overallScore: 84 },
    { tierNumber: 3, position: "Midfielder", playerName: "Eduardo Camavinga", price: 60, speed: 82, physical: 78, technique: 84, stamina: 89, precision: 81, defense: 84, pros: "Super Energetic", cons: "Loses Focus", overallScore: 85 },

    // Tier 3 Defenders ($40 - $70)
    { tierNumber: 3, position: "Defender", playerName: "Gabriel Magalhaes", price: 70, speed: 75, physical: 88, technique: 70, stamina: 84, precision: 75, defense: 86, pros: "Scores Corners", cons: "Angry Easily", overallScore: 86 },
    { tierNumber: 3, position: "Defender", playerName: "Lisandro Martinez", price: 50, speed: 76, physical: 85, technique: 82, stamina: 83, precision: 80, defense: 85, pros: "Tough Tackler", cons: "Very Short", overallScore: 85 },
    { tierNumber: 3, position: "Defender", playerName: "Manuel Akanji", price: 50, speed: 80, physical: 82, technique: 75, stamina: 82, precision: 76, defense: 84, pros: "Plays Anywhere", cons: "Makes Mistakes", overallScore: 85 },
    { tierNumber: 3, position: "Defender", playerName: "Jeremie Frimpong", price: 60, speed: 95, physical: 70, technique: 80, stamina: 91, precision: 82, defense: 72, pros: "Crazy Speed", cons: "Weak Defender", overallScore: 85 },
    { tierNumber: 3, position: "Defender", playerName: "Nathan Ake", price: 40, speed: 76, physical: 82, technique: 75, stamina: 80, precision: 76, defense: 84, pros: "Very Safe", cons: "Not Flashy", overallScore: 84 },

    // Tier 3 Goalkeepers ($30 - $50)
    { tierNumber: 3, position: "Goalkeeper", playerName: "Jordan Pickford", price: 40, speed: 55, physical: 80, technique: 84, stamina: 75, precision: 82, defense: 82, pros: "Kicks Far", cons: "Gets Nervous", overallScore: 84 },
    { tierNumber: 3, position: "Goalkeeper", playerName: "David Raya", price: 50, speed: 55, physical: 75, technique: 85, stamina: 72, precision: 83, defense: 83, pros: "Safe Hands", cons: "Short Height", overallScore: 85 },
    { tierNumber: 3, position: "Goalkeeper", playerName: "Guglielmo Vicario", price: 30, speed: 60, physical: 78, technique: 75, stamina: 74, precision: 77, defense: 82, pros: "Great Shot Saver", cons: "Not Famous Yet", overallScore: 84 },
  ];

  for (const p of playerData) {
    const existing = await db
      .select()
      .from(players)
      .where(eq(players.playerName, p.playerName));

    if (existing.length > 0) {
      await db
        .update(players)
        .set({ price: p.price, overallScore: p.overallScore })
        .where(eq(players.id, existing[0].id));
      console.log(`✓ Updated Player "${p.playerName}" Price -> $${p.price}`);
    } else {
      await db.insert(players).values(p);
      console.log(`+ Inserted Player "${p.playerName}" (Tier ${p.tierNumber} ${p.position} - $${p.price})`);
    }
  }

  console.log("✅ Seed completed successfully!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

