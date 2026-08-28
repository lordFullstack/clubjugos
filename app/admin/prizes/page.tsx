import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/get-admin-session";
import { getBusinessPrizes } from "@/services/prize-admin-service";
import { PrizeList } from "@/components/admin/prize-list";

export default async function AdminPrizesPage() {
  const result = await getAdminSession();

  if (result.status !== "ok" || result.session.role !== "ADMIN") {
    redirect("/admin");
  }

  const { businessId } = result.session;
  const prizes = businessId ? await getBusinessPrizes(businessId) : [];

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
