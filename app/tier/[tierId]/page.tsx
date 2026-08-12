import { redirect } from "next/navigation";
import { getTierQuestionDetails } from "@/lib/queries";
import QuestionView from "@/app/components/QuestionView";

export const dynamic = "force-dynamic";

interface TierPageProps {
  params: Promise<{
    tierId: string;
  }>;
}

export default async function TierPage({ params }: TierPageProps) {
  const { tierId } = await params;

  if (!tierId) {
    redirect("/dashboard");
  }

  const data = await getTierQuestionDetails(tierId);

  if (!data || "redirect" in data) {
    redirect("/dashboard");
  }

  return <QuestionView initialData={data} />;
}
