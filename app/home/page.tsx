import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCurrentCollection,
  getCustomerPrizes,
  getLastObtainedSticker,
} from "@/services/customer-service";
import { ProgressBar } from "@/components/progress-bar";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard, TicketDivider, StampBadge } from "@/components/ticket-card";
import { IconJuiceCup, IconScan, IconGift, IconAlbum } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RarityBadge } from "@/components/ui/rarity-badge";

/** "Próximo objetivo": nunca decimos CUÁL sticker falta (el sorteo es
 * aleatorio entre los pendientes, no hay un "siguiente" fijo) — solo
 * cuántos, que es la única información real que tenemos. */
function nextGoalText(remaining: number): string {
  if (remaining <= 0) return "¡Tu álbum está completo! 🎉";
  if (remaining === 1) return "¡Un sticker más y completas tu álbum!";
  return `Te faltan ${remaining} stickers para completar tu álbum`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCustomerProfile(user.id);
  const businessId = profile?.business_id ?? null;

  const [{ campaign, obtainedCount }, prizes, lastSticker] =
    await Promise.all([
      getCurrentCollection(businessId, user.id),
      getCustomerPrizes(businessId, user.id),
      getLastObtainedSticker(businessId, user.id),
    ]);

  const firstName = (profile?.name ?? "amigo").split(" ")[0];
  const target = campaign?.completion_target ?? 0;
  const progressPct = target > 0 ? Math.round((obtainedCount / target) * 100) : 0;
  const availablePrizeCount = prizes.filter((p) => p.status === "AVAILABLE").length;

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

      {/* UI PACK LOOP 02: orden saludo -> progreso -> CTA -> stickers
          recientes -> siguiente objetivo -> navegación. La card de
          progreso ahora es solo eso (progreso): el mini-grid de stickers
          que tenía antes se sacó por redundar con Álbum (no está en el
          mockup de Home tampoco), y "próximo objetivo" pasa a ser su
          propia sección más abajo. */}
      <section className="mt-6">
        {campaign ? (
          <TicketCard className="px-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-citrus-500">
                  Colección activa
                </p>
                <h2 className="mt-0.5 font-display text-base font-bold text-ink-700">
                  {campaign.name}
                </h2>
              </div>
              <StampBadge>{progressPct}%</StampBadge>
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

      {lastSticker && (
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-500">
            Último sticker obtenido
          </h2>
          <TicketCard className="mt-2 flex items-center gap-3 px-4 pb-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-paper-50">
              {lastSticker.image_url ? (
                <Image
                  src={lastSticker.image_url}
                  alt={lastSticker.name}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              ) : (
                <IconAlbum className="h-8 w-8 text-citrus-300" strokeWidth={1.4} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink-900">{lastSticker.name}</p>
              <RarityBadge rarity={lastSticker.rarity} className="mt-1" />
            </div>
          </TicketCard>
        </section>
      )}

      {campaign && (
        <section className="mt-6 flex items-center gap-3 rounded-2xl bg-jade-50 px-4 py-3.5 text-jade-700">
          <IconAlbum className="h-5 w-5 shrink-0" strokeWidth={1.8} />
          <p className="text-sm font-semibold">
            {nextGoalText(Math.max(target - obtainedCount, 0))}
          </p>
        </section>
      )}

      {availablePrizeCount > 0 && (
        <Link
          href="/prizes"
          className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-b from-foil-light to-foil px-4 py-3.5 text-ink-900 shadow-card transition active:scale-[0.98]"
        >
          <IconGift className="h-6 w-6 shrink-0" strokeWidth={1.8} />
          <span className="flex-1 text-sm font-bold">
            Tenés {availablePrizeCount === 1 ? "un premio disponible" : `${availablePrizeCount} premios disponibles`}
          </span>
          <span className="text-xs font-bold uppercase tracking-wide">Ver →</span>
        </Link>
      )}

      <BottomNav />
    </main>
  );
}
