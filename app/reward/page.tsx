import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RewardReveal } from "@/components/reward-reveal";

export default async function RewardPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    img?: string;
    rarity?: string;
    complete?: string;
    count?: string;
    target?: string;
    prize?: string;
    spName?: string;
    spImg?: string;
    spRarity?: string;
    spDup?: string;
    spPrize?: string;
    spPrizeName?: string;
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

  // Debe venir de un escaneo real: al menos un sticker nuevo o un especial.
  if (!params.name && !params.spName) {
    redirect("/home");
  }

  return (
    <RewardReveal
      sticker={
        params.name
          ? {
              name: params.name,
              imageUrl: params.img ?? null,
              rarity: params.rarity ?? "COMMON",
            }
          : null
      }
      collectionComplete={params.complete === "1"}
      obtainedCount={Number(params.count ?? 0)}
      completionTarget={Number(params.target ?? 0)}
      prizeUnlocked={params.prize === "1"}
      special={
        params.spName
          ? {
              name: params.spName,
              imageUrl: params.spImg ?? null,
              rarity: params.spRarity ?? "EPIC",
              isDuplicate: params.spDup === "1",
              prizeUnlocked: params.spPrize === "1",
              prizeName: params.spPrizeName ?? null,
            }
          : null
      }
    />
  );
}
