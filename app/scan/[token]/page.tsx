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

  const params2 = new URLSearchParams({
    name: result.sticker.name,
    emoji: result.sticker.emoji ?? "🧃",
    rarity: result.sticker.rarity,
    dup: result.isDuplicate ? "1" : "0",
    count: String(result.obtainedCount),
    target: String(result.completionTarget),
    prize: result.prizeUnlocked ? "1" : "0",
  });

  redirect(`/reward?${params2.toString()}`);
}
