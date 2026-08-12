import { redirect } from "next/navigation";
import { getMarketplaceData } from "@/lib/queries";
import MarketplaceView from "@/app/components/MarketplaceView";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const data = await getMarketplaceData();

  if (!data) {
    redirect("/");
  }

  return (
    <MarketplaceView
      initialTeam={data.team}
      initialPlayers={data.players}
      initialOwnedCount={data.ownedCount}
    />
  );
}
