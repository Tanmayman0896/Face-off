import { db } from "../db";
import { players } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("⚽ Updating player prices in database...");

  const newPrices: Record<string, number> = {
    // Tier 1 Strikers ($3,400 - $4,200)
    "Cristiano Ronaldo": 3600,
    "Kylian Mbappe": 4200,
    "Erling Haaland": 3950,
    "Lionel Messi": 4100,
    "Harry Kane": 3500,
    "Vinicius Junior": 3400,

    // Tier 1 Midfielders ($2,900 - $3,800)
    "Kevin De Bruyne": 3700,
    "Jude Bellingham": 3800,
    "Rodri": 3750,
    "Martin Odegaard": 3100,
    "Luka Modric": 2900,

    // Tier 1 Defenders ($2,800 - $3,550)
    "Virgil van Dijk": 3550,
    "Ruben Dias": 3300,
    "Antonio Rudiger": 3100,
    "Trent Alexander-Arnold": 2950,
    "Alphonso Davies": 2800,

    // Tier 1 Goalkeepers ($2,900 - $3,200)
    "Alisson Becker": 3200,
    "Thibaut Courtois": 3200,
    "Ederson": 2900,

    // Tier 2 Strikers ($2,500 - $3,100)
    "Bukayo Saka": 2850,
    "Mohamed Salah": 3100,
    "Victor Osimhen": 2750,
    "Heung-Min Son": 2750,
    "Rafael Leao": 2500,

    // Tier 2 Midfielders ($2,450 - $3,000)
    "Declan Rice": 2800,
    "Bruno Fernandes": 2800,
    "Federico Valverde": 3000,
    "Jamal Musiala": 2700,
    "Pedri": 2450,

    // Tier 2 Defenders ($2,200 - $2,700)
    "William Saliba": 2700,
    "John Stones": 2400,
    "Kyle Walker": 2200,
    "Theo Hernandez": 2400,
    "Marquinhos": 2400,

    // Tier 2 Goalkeepers ($2,300 - $2,700)
    "Marc-Andre ter Stegen": 2700,
    "Emiliano Martinez": 2300,
    "Mike Maignan": 2700,

    // Tier 3 Strikers ($1,400 - $1,700)
    "Ollie Watkins": 1550,
    "Alexander Isak": 1550,
    "Julian Alvarez": 1700,
    "Raphinha": 1400,
    "Marcus Rashford": 1400,

    // Tier 3 Midfielders ($950 - $1,400)
    "Enzo Fernandez": 1400,
    "Dominik Szoboszlai": 1400,
    "Alexis Mac Allister": 1400,
    "Gavi": 950,
    "Eduardo Camavinga": 1400,

    // Tier 3 Defenders ($950 - $1,550)
    "Gabriel Magalhaes": 1550,
    "Lisandro Martinez": 1200,
    "Manuel Akanji": 1200,
    "Jeremie Frimpong": 1400,
    "Nathan Ake": 950,

    // Tier 3 Goalkeepers ($800 - $1,200)
    "Jordan Pickford": 950,
    "David Raya": 1200,
    "Guglielmo Vicario": 800,
  };

  const dbPlayers = await db.select({ id: players.id, playerName: players.playerName, price: players.price }).from(players);

  let updatedCount = 0;
  for (const player of dbPlayers) {
    const targetPrice = newPrices[player.playerName];
    if (targetPrice !== undefined) {
      await db
        .update(players)
        .set({ price: targetPrice })
        .where(eq(players.id, player.id));
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} player prices in DB.`);
}

main().catch((err) => {
  console.error("❌ Update failed:", err);
  process.exit(1);
});
