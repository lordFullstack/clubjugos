import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCustomerPrizes,
  type PrizeStatus,
} from "@/services/customer-service";
import { RedeemPrizeButton } from "@/components/redeem-prize-button";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard } from "@/components/ticket-card";
import { IconGift } from "@/components/icons";

const STATUS_LABEL: Record<PrizeStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Disponible", className: "bg-citrus-100 text-citrus-700" },
  REDEEMED: { label: "Canjeado", className: "bg-ink-900/5 text-ink-500" },
  EXPIRED: { label: "Expirado", className: "bg-red-50 text-red-500" },
  LOCKED: { label: "Bloqueado", className: "bg-ink-900/5 text-ink-500" },
};

export default async function PrizesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCustomerProfile(user.id);
  const prizes = await getCustomerPrizes(profile?.business_id ?? null);

  return (
    <main className="min-h-screen bg-paper-100 px-6 pb-32 pt-8">
      <h1 className="font-display text-3xl font-black text-ink-900">
        Premios
      </h1>

      {prizes.length === 0 ? (
        <TicketCard className="mt-6 px-6 pb-6 text-center">
          <IconGift className="mx-auto h-10 w-10 text-citrus-400" strokeWidth={1.6} />
          <p className="mt-2 font-semibold text-ink-900">
            Todavía no hay premios configurados
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Cuando tu juguería active premios, los vas a ver acá.
          </p>
        </TicketCard>
      ) : (
        <ul className="mt-6 space-y-3">
          {prizes.map((prize) => {
            const status = STATUS_LABEL[prize.status];
            return (
              <li key={prize.id}>
                <TicketCard className="flex flex-wrap items-center gap-3 px-4 pb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-citrus-50 text-citrus-500">
                    <IconGift className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-900">{prize.name}</p>
                    <p className="font-mono text-xs text-ink-500">
                      Requiere {prize.required_stickers} stickers
                    </p>
                  </div>
                  {prize.status === "AVAILABLE" && prize.customerPrizeId ? (
                    <RedeemPrizeButton customerPrizeId={prize.customerPrizeId} />
                  ) : (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  )}
                </TicketCard>
              </li>
            );
          })}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
