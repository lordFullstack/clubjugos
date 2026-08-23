import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCurrentCollection,
} from "@/services/customer-service";
import { StickerGrid } from "@/components/sticker-grid";
import { ProgressBar } from "@/components/progress-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCustomerProfile();
  const { campaign, stickers, obtainedCount } = await getCurrentCollection(
    profile?.business_id ?? null,
  );

  const target = campaign?.completion_target ?? 0;
  const progressPct = target > 0 ? Math.round((obtainedCount / target) * 100) : 0;

  return (
    <main className="min-h-screen bg-brand-50 px-6 pb-28 pt-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Mi colección
      </h1>

      {campaign ? (
        <>
          <p className="mt-1 text-sm text-ink-500">{campaign.name}</p>

          <div className="mt-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold text-ink-900">
                {obtainedCount} / {target}
              </span>
              <span className="font-semibold text-ink-500">{progressPct}%</span>
            </div>
            <ProgressBar percent={progressPct} />
          </div>

          <div className="mt-6">
            <StickerGrid stickers={stickers} size="md" />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-3xl bg-white p-6 text-center shadow-card">
          <div className="text-4xl" role="img" aria-label="Stickers">
            🎴
          </div>
          <p className="mt-2 font-semibold text-ink-900">
            Todavía no hay una colección activa
          </p>
          <p className="mt-1 text-sm text-ink-500">
            En cuanto tu juguería active una temporada, vas a ver tus stickers
            acá.
          </p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
