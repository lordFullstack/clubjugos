import { createClient } from "@/lib/supabase/server";

export type StickerRow = {
  id: string;
  campaignStickerId: string;
  name: string;
  description: string | null;
  emoji: string | null;
  imageUrl: string | null;
  rarity: string;
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
      "id, probability, status, stickers(id, name, description, emoji, image_url, rarity)",
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
      emoji: sticker?.emoji ?? null,
      imageUrl: sticker?.image_url ?? null,
      rarity: sticker?.rarity ?? "COMMON",
      probability: Number(row.probability),
      active: row.status === "active",
    };
  });
}
