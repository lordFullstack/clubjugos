import { createClient } from "@/lib/supabase/server";

export type StickerRow = {
  id: string;
  campaignStickerId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  rarity: string;
  kind: "COLLECTIBLE" | "SPECIAL";
  specialPrizeId: string | null;
  probability: number;
  active: boolean;
  /** Clientes distintos que ya tienen este sticker (para proteger el borrado). */
  ownedByCustomers: number;
};

export async function getCampaignStickers(
  campaignId: string,
): Promise<StickerRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_stickers")
    .select(
      "id, probability, status, stickers(id, name, description, image_url, rarity, kind, special_prize_id)",
    )
    .eq("campaign_id", campaignId)
    .order("probability", { ascending: false });

  // Cuántos clientes distintos tienen cada sticker de la campaña. El admin ve
  // `customer_stickers` de su negocio por la policy `customer_stickers_select_staff`.
  const { data: owned } = await supabase
    .from("customer_stickers")
    .select("sticker_id, customer_id")
    .eq("campaign_id", campaignId);
  const ownersByStickerId = new Map<string, Set<string>>();
  for (const row of owned ?? []) {
    const set = ownersByStickerId.get(row.sticker_id) ?? new Set<string>();
    set.add(row.customer_id);
    ownersByStickerId.set(row.sticker_id, set);
  }

  return (data ?? []).map((row) => {
    const sticker = Array.isArray(row.stickers) ? row.stickers[0] : row.stickers;
    return {
      id: sticker?.id ?? "",
      campaignStickerId: row.id,
      name: sticker?.name ?? "",
      description: sticker?.description ?? null,
      imageUrl: sticker?.image_url ?? null,
      rarity: sticker?.rarity ?? "COMMON",
      kind: (sticker?.kind as "COLLECTIBLE" | "SPECIAL") ?? "COLLECTIBLE",
      specialPrizeId: sticker?.special_prize_id ?? null,
      probability: Number(row.probability),
      active: row.status === "active",
      ownedByCustomers: ownersByStickerId.get(sticker?.id ?? "")?.size ?? 0,
    };
  });
}
