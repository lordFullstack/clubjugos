import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCustomerPrizes,
} from "@/services/customer-service";
import { RedeemPrizeButton } from "@/components/redeem-prize-button";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard } from "@/components/ticket-card";
import { PrizeCard } from "@/components/prize-card";
import { IconGift } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";

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
        <TicketCard className="mt-6 px-6 pb-6">
          <EmptyState
            bare
            icon={<IconGift className="mx-auto h-10 w-10" strokeWidth={1.6} />}
            title="Todavía no hay premios configurados"
            message="Cuando tu juguería active premios, los vas a ver acá."
          />
        </TicketCard>
      ) : (
        <ul className="mt-6 space-y-3">
          {prizes.map((prize) => (
            <li key={prize.id}>
              <PrizeCard
                name={prize.name}
                requiredStickers={prize.required_stickers}
                status={prize.status}
                action={
                  prize.status === "AVAILABLE" && prize.customerPrizeId ? (
                    <RedeemPrizeButton customerPrizeId={prize.customerPrizeId} />
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
