import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignStickers } from "@/services/sticker-admin-service";
import { StickerList } from "@/components/admin/sticker-list";

export default async function AdminStickersPage() {
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

  const { data: campaign } = profile.business_id
    ? await supabase
        .from("campaigns")
        .select("id")
        .eq("business_id", profile.business_id)
        .eq("status", "active")
        .maybeSingle()
    : { data: null };

  const stickers = campaign ? await getCampaignStickers(campaign.id) : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Stickers
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Stickers de la temporada activa y su probabilidad de aparición.
      </p>

      {!campaign ? (
        <p className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
          Activa una campaña primero en la sección Campaña.
        </p>
      ) : (
        <StickerList campaignId={campaign.id} stickers={stickers} />
      )}
    </div>
  );
}
