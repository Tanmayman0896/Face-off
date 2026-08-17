import { getDashboardData } from "@/lib/queries";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data, offline } = await getDashboardData();

  // Pass data (or null if offline) and the offline flag to the client component
  // DashboardClient will read from localStorage when offline=true and data=null
  return <DashboardClient serverData={data} isOffline={offline} />;
}
