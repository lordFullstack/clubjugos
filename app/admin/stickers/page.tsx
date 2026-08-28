import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/get-admin-session";
import { createClient } from "@/lib/supabase/server";
import { getCampaignStickers } from "@/services/sticker-admin-service";
import { getBusinessPrizes } from "@/services/prize-admin-service";
import { StickerList } from "@/components/admin/sticker-list";

export default async function AdminStickersPage() {
  const result = await getAdminSession();

  if (result.status !== "ok" || result.session.role !== "ADMIN") {
    redirect("/admin");
  }

  const { businessId } = result.session;
  const supabase = await createClient();

  // La campaña activa y los premios del negocio no dependen uno del otro:
  // se piden en paralelo en vez de esperar uno para empezar el siguiente.
  const [{ data: campaign }, prizes] = await Promise.all([
    businessId
      ? supabase
          .from("campaigns")
          .select("id")
          .eq("business_id", businessId)
          .eq("status", "active")
          .maybeSingle()
      : Promise.resolve({ data: null }),
    businessId ? getBusinessPrizes(businessId) : Promise.resolve([]),
  ]);

  const stickers = campaign ? await getCampaignStickers(campaign.id) : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Stickers
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Coleccionables del álbum y stickers especiales con premio propio.
      </p>

      {!campaign ? (
        <p className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
          Activa una campaña primero en la sección Campaña.
        </p>
      ) : (
        <StickerList campaignId={campaign.id} stickers={stickers} prizes={prizes} />
      )}
    </div>
  );
}
