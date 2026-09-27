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
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCustomerProfile(user.id);
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
          <TicketCard className="px-6 pb-6">
            <EmptyState
              bare
              icon={<IconJuiceCup className="mx-auto h-10 w-10" strokeWidth={1.6} />}
              title="Todavía no estás en ninguna temporada activa"
              message="Pedile a tu juguería que te sume a la campaña actual."
            />
          </TicketCard>
        )}
      </section>

      <Button href="/scan" className="mt-6">
        <IconScan className="h-5 w-5" strokeWidth={2.1} />
        ESCANEAR QR
      </Button>

      <BottomNav />
    </main>
  );
}
