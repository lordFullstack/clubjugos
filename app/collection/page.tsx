import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCurrentCollection,
  getCampaignSpecials,
} from "@/services/customer-service";
import { StickerAlbumGrid } from "@/components/sticker-album-grid";
import { ProgressBar } from "@/components/progress-bar";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard, TicketDivider, StampBadge } from "@/components/ticket-card";
import { IconAlbum } from "@/components/icons";
import { SpecialAlbum } from "@/components/special-album";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCustomerProfile(user.id);
  const [{ campaign, stickers, obtainedCount }, specials] = await Promise.all([
    getCurrentCollection(profile?.business_id ?? null, user.id),
    getCampaignSpecials(profile?.business_id ?? null, user.id),
  ]);

  const target = campaign?.completion_target ?? 0;
  const progressPct = target > 0 ? Math.round((obtainedCount / target) * 100) : 0;
  const complete = target > 0 && obtainedCount >= target;

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
            {complete && (
              <p className="mt-2 text-xs font-bold text-jade-500">
                🎉 ¡Álbum completo! Sigue escaneando por premios especiales.
              </p>
            )}
          </TicketDivider>

          <div className="mt-5">
            <StickerAlbumGrid stickers={stickers} />
          </div>
        </TicketCard>
      ) : (
        <TicketCard className="mt-6 px-6 pb-6">
          <EmptyState
            bare
            icon={<IconAlbum className="mx-auto h-10 w-10" strokeWidth={1.6} />}
            title="Todavía no hay una colección activa"
            message="En cuanto tu juguería active una temporada, vas a ver tus stickers acá."
          />
        </TicketCard>
      )}

      {specials.length > 0 && <SpecialAlbum specials={specials} />}

      <BottomNav />
    </main>
  );
}
