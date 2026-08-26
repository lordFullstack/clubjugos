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
    };
  });
}
