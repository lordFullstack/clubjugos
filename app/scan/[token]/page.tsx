import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { scanQrToken } from "@/services/scan-service";

export default async function ScanTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/scan/${token}`);
  }

  const result = await scanQrToken(token);

  if (!result.success) {
    redirect(`/scan?error=${encodeURIComponent(result.error)}`);
  }

  const p = new URLSearchParams({
    complete: result.collectionComplete ? "1" : "0",
    count: String(result.obtainedCount),
    target: String(result.completionTarget),
    prize: result.prizeUnlocked ? "1" : "0",
  });

  if (result.sticker) {
    p.set("name", result.sticker.name);
    if (result.sticker.imageUrl) p.set("img", result.sticker.imageUrl);
    p.set("rarity", result.sticker.rarity);
  }

  if (result.special) {
    p.set("spName", result.special.name);
    if (result.special.imageUrl) p.set("spImg", result.special.imageUrl);
    p.set("spRarity", result.special.rarity);
    p.set("spDup", result.special.isDuplicate ? "1" : "0");
    p.set("spPrize", result.special.prizeUnlocked ? "1" : "0");
    if (result.special.prizeName) p.set("spPrizeName", result.special.prizeName);
  }

  redirect(`/reward?${p.toString()}`);
}
