import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCurrentCollection,
  getSpecialWins,
} from "@/services/customer-service";
import { StickerGrid } from "@/components/sticker-grid";
import { ProgressBar } from "@/components/progress-bar";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard, TicketDivider, StampBadge } from "@/components/ticket-card";
import { IconAlbum, IconGift } from "@/components/icons";
import Image from "next/image";

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
  const specialWins = await getSpecialWins(profile?.business_id ?? null);

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
            <StickerGrid stickers={stickers} size="md" />
          </div>
        </TicketCard>
      ) : (
        <TicketCard className="mt-6 px-6 pb-6 text-center">
          <IconAlbum className="mx-auto h-10 w-10 text-citrus-400" strokeWidth={1.6} />
          <p className="mt-2 font-semibold text-ink-900">
            Todavía no hay una colección activa
          </p>
          <p className="mt-1 text-sm text-ink-500">
            En cuanto tu juguería active una temporada, vas a ver tus stickers
            acá.
          </p>
        </TicketCard>
      )}

      {specialWins.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-lg font-extrabold text-ink-900">
            ⚡ Especiales ganados
          </h2>
          <TicketCard className="mt-3 px-5 pb-5" tone="jade">
            <ul className="space-y-2">
              {specialWins.map((win) => (
                <li
                  key={win.id}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                    {win.image_url ? (
                      <Image
                        src={win.image_url}
                        alt=""
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    ) : (
                      <IconGift className="h-5 w-5 text-foil-light" strokeWidth={1.6} />
                    )}
                  </div>
                  <span className="flex-1 truncate font-semibold text-white">
                    {win.name}
                  </span>
                  {win.count > 1 && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-xs font-bold text-foil-light">
                      x{win.count}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </TicketCard>
        </section>
      )}

      <BottomNav />
    </main>
  );
}
