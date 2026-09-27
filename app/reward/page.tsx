import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StickerRevealModal } from "@/components/sticker-reveal-modal";
import { verifyRewardPayload } from "@/lib/reward/sign";

export default async function RewardPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { t } = await searchParams;

  // LOOP 08: un solo token firmado (ver lib/reward/sign.ts) en vez de
  // campos sueltos en la URL. Si falta, está corrupto, venció (5 min) o le
  // pertenece a otra sesión, no hay nada que mostrar — se trata igual que
  // "no vino de un escaneo real", como ya hacía el chequeo anterior.
  const payload = t ? verifyRewardPayload(t, user.id) : null;

  if (!payload || (!payload.name && !payload.spName)) {
    redirect("/home");
  }

  return (
    <StickerRevealModal
      sticker={
        payload.name
          ? {
              name: payload.name,
              imageUrl: payload.img ?? null,
              rarity: payload.rarity ?? "COMMON",
            }
          : null
      }
      collectionComplete={payload.complete}
      obtainedCount={payload.count}
      completionTarget={payload.target}
      prizeUnlocked={payload.prize}
      special={
        payload.spName
          ? {
              name: payload.spName,
              imageUrl: payload.spImg ?? null,
              rarity: payload.spRarity ?? "EPIC",
              isDuplicate: payload.spDup ?? false,
              prizeUnlocked: payload.spPrize ?? false,
              prizeName: payload.spPrizeName ?? null,
            }
          : null
      }
    />
  );
}
