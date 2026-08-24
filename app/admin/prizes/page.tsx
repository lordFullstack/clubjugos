import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessPrizes } from "@/services/prize-admin-service";
import { PrizeList } from "@/components/admin/prize-list";

export default async function AdminPrizesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, business_id")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect("/admin");
  }

  const prizes = profile.business_id
    ? await getBusinessPrizes(profile.business_id)
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Premios
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Los clientes solo ven los premios activos.
      </p>

      <PrizeList prizes={prizes} />
    </div>
  );
}
