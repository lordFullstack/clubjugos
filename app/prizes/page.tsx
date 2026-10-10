import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCustomerPrizes,
  type PrizeView,
} from "@/services/customer-service";
import { RedeemPrizeButton } from "@/components/redeem-prize-button";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard } from "@/components/ticket-card";
import { PrizeCard } from "@/components/prize-card";
import { IconGift } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

function PrizeList({ prizes }: { prizes: PrizeView[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {prizes.map((prize) => (
        <li key={prize.id}>
          <PrizeCard
            name={prize.name}
            description={prize.description}
            requiredStickers={prize.required_stickers}
            source={prize.source}
            imageUrl={prize.imageUrl}
            status={prize.status}
            expiresAt={prize.expiresAt}
            redeemedAt={prize.redeemedAt}
            action={
              prize.status === "AVAILABLE" && prize.customerPrizeId ? (
                <RedeemPrizeButton customerPrizeId={prize.customerPrizeId} />
              ) : undefined
            }
          />
        </li>
      ))}
    </ul>
  );
}

export default async function PrizesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCustomerProfile(user.id);
  const prizes = await getCustomerPrizes(profile?.business_id ?? null, user.id);

  // Pack UI LOOP 06 (mockup): dos pestañas. "Disponibles" = lo que se puede
  // canjear ahora + lo que sigue bloqueado; "Mis premios" = el historial
  // (canjeados y vencidos). Cubre los cuatro estados que pide el loop:
  // disponible, canjeado, bloqueado y vacío.
  const available = prizes.filter((p) => p.status === "AVAILABLE");
  const redeemed = prizes.filter((p) => p.status === "REDEEMED");
  const locked = prizes.filter((p) => p.status === "LOCKED");
  const expired = prizes.filter((p) => p.status === "EXPIRED");
  const noPrizesConfigured = prizes.length === 0;
  const nothingEarnedYet = available.length === 0 && redeemed.length === 0;
  const history = redeemed.length + expired.length;

  const availableTab = (
    <>
      {available.length > 0 ? (
        <PrizeList prizes={available} />
      ) : (
        <TicketCard className="px-6 pb-6">
          <EmptyState
            bare
            icon={<IconGift className="mx-auto h-10 w-10" strokeWidth={1.6} />}
            title="Todavía no tienes premios para canjear"
            message="Sigue completando tu álbum o escaneando por especiales — acá vas a ver los que desbloquees."
          />
        </TicketCard>
      )}

      {locked.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
            Por conseguir
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            {nothingEarnedYet
              ? "Todavía no ganaste ninguno de estos — así se ven mientras siguen bloqueados."
              : "Estos siguen bloqueados hasta que los desbloquees."}
          </p>
          <PrizeList prizes={locked} />
        </section>
      )}
    </>
  );

  const historyTab =
    history === 0 ? (
      <TicketCard className="px-6 pb-6">
        <EmptyState
          bare
          icon={<IconGift className="mx-auto h-10 w-10" strokeWidth={1.6} />}
          title="Todavía no has canjeado premios"
          message="Cuando canjees uno, queda registrado acá."
        />
      </TicketCard>
    ) : (
      <>
        {redeemed.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
              Canjeados
            </h2>
            <PrizeList prizes={redeemed} />
          </section>
        )}
        {expired.length > 0 && (
          <section className={redeemed.length > 0 ? "mt-8" : ""}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
              Vencidos
            </h2>
            <PrizeList prizes={expired} />
          </section>
        )}
      </>
    );

  return (
    <main className="min-h-screen bg-paper-100 px-6 pb-32 pt-8">
      <h1 className="font-display text-3xl font-black text-ink-900">
        Premios
      </h1>

      <div className="mt-6">
        {noPrizesConfigured ? (
          <TicketCard className="px-6 pb-6">
            <EmptyState
              bare
              icon={<IconGift className="mx-auto h-10 w-10" strokeWidth={1.6} />}
              title="Todavía no hay premios configurados"
              message="Cuando tu juguería active premios, los vas a ver acá."
            />
          </TicketCard>
        ) : (
          <SegmentedTabs
            tabs={[
              {
                id: "available",
                label: "Disponibles",
                count: available.length,
                content: availableTab,
              },
              { id: "history", label: "Mis premios", content: historyTab },
            ]}
          />
        )}
      </div>

      <BottomNav />
    </main>
  );
}
