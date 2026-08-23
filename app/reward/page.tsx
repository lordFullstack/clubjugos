import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RewardReveal } from "@/components/reward-reveal";

export default async function RewardPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    emoji?: string;
    rarity?: string;
    dup?: string;
    count?: string;
    target?: string;
    prize?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  if (!params.name) {
    redirect("/home");
  }

  return (
    <RewardReveal
      name={params.name}
      emoji={params.emoji ?? "🧃"}
      rarity={params.rarity ?? "COMMON"}
      isDuplicate={params.dup === "1"}
      obtainedCount={Number(params.count ?? 0)}
      completionTarget={Number(params.target ?? 0)}
      prizeUnlocked={params.prize === "1"}
    />
  );
}
