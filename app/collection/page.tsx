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
    <main className="min-h-screen bg-paper-100 px-6 pb-32 pt-8">
      <h1 className="font-display text-3xl font-black text-ink-900">
        Mi álbum
      </h1>

      {campaign ? (
        <TicketCard className="mt-5 px-5 pb-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-lg font-extrabold text-ink-900">
              {campaign.name}
            </p>
            <StampBadge>{progressPct}%</StampBadge>
          </div>

          <TicketDivider className="mt-3 pt-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-mono font-bold text-ink-900">
                {obtainedCount} / {target}
              </span>
              <span className="font-semibold text-ink-500">stickers</span>
            </div>
            <ProgressBar percent={progressPct} />
          </TicketDivider>

          <div className="mt-5">
            <StickerGrid stickers={stickers} size="md" />
          </div>
        </TicketCard>
      ) : (
        <TicketCard className="mt-6 px-6 pb-6 text-center">
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
        </TicketCard>
      )}

      <BottomNav />
    </main>
  );
}
