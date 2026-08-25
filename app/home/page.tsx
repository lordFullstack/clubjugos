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
import { TicketCard, TicketDivider, StampBadge } from "@/components/ticket-card";
import { IconJuiceCup, IconScan } from "@/components/icons";

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
    <main className="min-h-screen bg-paper-100 px-6 pb-32 pt-8">
      <header>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-citrus-500">
          Hola
        </p>
        <h1 className="font-display text-3xl font-black text-ink-900">
          {firstName}
        </h1>
      </header>

      <section className="mt-6">
        {campaign ? (
          <TicketCard className="px-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-citrus-500">
                  Colección activa
                </p>
                <h2 className="mt-0.5 font-display text-lg font-extrabold text-ink-900">
                  {campaign.name}
                </h2>
              </div>
              <StampBadge>{progressPct}%</StampBadge>
            </div>

            <div className="mt-4">
              <StickerGrid stickers={stickers} size="sm" />
            </div>

            <TicketDivider className="mt-4 pt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-mono font-bold text-ink-900">
                  {obtainedCount} / {target}
                </span>
                <span className="font-semibold text-ink-500">stickers</span>
              </div>
              <ProgressBar percent={progressPct} />
            </TicketDivider>
          </TicketCard>
        ) : (
          <TicketCard className="px-6 pb-6 text-center">
            <IconJuiceCup className="mx-auto h-10 w-10 text-citrus-400" strokeWidth={1.6} />
            <p className="mt-2 font-semibold text-ink-900">
              Todavía no estás en ninguna temporada activa
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Pedile a tu juguería que te sume a la campaña actual.
            </p>
          </TicketCard>
        )}
      </section>

      <Link
        href="/scan"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-citrus-400 to-citrus-600 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98]"
      >
        <IconScan className="h-5 w-5" strokeWidth={2.1} />
        ESCANEAR QR
      </Link>

      <BottomNav />
    </main>
  );
}
