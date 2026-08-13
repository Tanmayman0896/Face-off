import { db } from "../db";
import { players } from "../db/schema";
import { asc } from "drizzle-orm";

async function main() {
  console.log("🔍 Verifying player prices in database...");

  const allPlayers = await db
    .select()
    .from(players)
    .orderBy(asc(players.tierNumber), asc(players.price));

  console.log(`Total players in DB: ${allPlayers.length}\n`);

  for (const tierNum of [1, 2, 3]) {
    const tierPlayers = allPlayers.filter((p) => p.tierNumber === tierNum);
    const minPrice = Math.min(...tierPlayers.map((p) => p.price));
    const maxPrice = Math.max(...tierPlayers.map((p) => p.price));
    const avgPrice = Math.round(
      tierPlayers.reduce((sum, p) => sum + p.price, 0) / (tierPlayers.length || 1)
    );

    console.log(`--- TIER ${tierNum} (${tierPlayers.length} players) ---`);
    console.log(`Min Price: $${minPrice.toLocaleString()}`);
    console.log(`Max Price: $${maxPrice.toLocaleString()}`);
    console.log(`Avg Price: $${avgPrice.toLocaleString()}`);
    console.log(`Sample Players:`);
    tierPlayers.slice(0, 4).forEach((p) => {
      console.log(`  - ${p.playerName} (${p.position}, OVR ${p.overallScore}): $${p.price.toLocaleString()}`);
    });
    console.log("");
  }
}

main().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
