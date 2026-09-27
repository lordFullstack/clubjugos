import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { scanQrToken } from "@/services/scan-service";
import { signRewardPayload, type RewardPayload } from "@/lib/reward/sign";

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

  // LOOP 08: un solo token firmado en vez de campos sueltos en la URL — ver
  // lib/reward/sign.ts. El backend (redeem_qr_token) ya decidió y grabó
  // todo esto; acá solo se empaqueta el resultado para mostrarlo una vez.
  const payload: RewardPayload = {
    customerId: user.id,
    complete: result.collectionComplete,
    count: result.obtainedCount,
    target: result.completionTarget,
    prize: result.prizeUnlocked,
    name: result.sticker?.name,
    img: result.sticker?.imageUrl ?? undefined,
    rarity: result.sticker?.rarity,
    spName: result.special?.name,
    spImg: result.special?.imageUrl ?? undefined,
    spRarity: result.special?.rarity,
    spDup: result.special?.isDuplicate,
    spPrize: result.special?.prizeUnlocked,
    spPrizeName: result.special?.prizeName ?? undefined,
  };

  const signedToken = signRewardPayload(payload);
  redirect(`/reward?t=${encodeURIComponent(signedToken)}`);
}
