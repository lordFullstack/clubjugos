import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCurrentCollection,
} from "@/services/customer-service";
import { StickerGrid } from "@/components/sticker-grid";
import { ProgressBar } from "@/components/progress-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function HomePage() {
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

  const firstName = (profile?.name ?? "amigo").split(" ")[0];
  const target = campaign?.completion_target ?? 0;
  const progressPct = target > 0 ? Math.round((obtainedCount / target) * 100) : 0;

  return (
    <main className="min-h-screen bg-brand-50 px-6 pb-28 pt-8">
      <header>
        <p className="text-sm font-medium text-ink-500">Hola 👋</p>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">
          {firstName}
        </h1>
      </header>

      <section className="mt-6">
        {campaign ? (
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-500">
              Colección
            </p>
            <h2 className="mt-0.5 font-display text-lg font-extrabold text-ink-900">
              {campaign.name}
            </h2>

            <div className="mt-4">
              <StickerGrid stickers={stickers} size="sm" />
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-bold text-ink-900">
                  {obtainedCount} / {target}
                </span>
                <span className="font-semibold text-ink-500">{progressPct}%</span>
              </div>
              <ProgressBar percent={progressPct} />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 text-center shadow-card">
            <div className="text-4xl" role="img" aria-label="Vaso de jugo">
              🥤
            </div>
            <p className="mt-2 font-semibold text-ink-900">
              Todavía no estás en ninguna temporada activa
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Pedile a tu juguería que te sume a la campaña actual.
            </p>
          </div>
        )}
      </section>

      <Link
        href="/scan"
        className="mt-6 block w-full rounded-2xl bg-brand-500 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98] active:bg-brand-600"
      >
        📷 ESCANEAR QR
      </Link>

      <BottomNav />
    </main>
  );
}
