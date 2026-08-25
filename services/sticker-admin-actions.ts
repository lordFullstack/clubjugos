"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-role";
import { createServiceClient } from "@/lib/supabase/service";

const stickerSchema = z.object({
  name: z.string().trim().min(1, "Ingresa un nombre").max(60),
  description: z.string().trim().max(300).optional(),
  emoji: z.string().trim().min(1, "Ingresa un emoji").max(8),
  imageUrl: z.string().trim().max(300).optional(),
  rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
  probability: z.coerce
    .number()
    .min(0.01, "Debe ser mayor a 0")
    .max(100, "No puede ser mayor a 100"),
});

export type StickerFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveSticker(
  ids: { stickerId: string | null; campaignId: string },
  _prevState: StickerFormState,
  formData: FormData,
): Promise<StickerFormState> {
  const auth = await requireStaff(["ADMIN"]);
  if ("error" in auth) return { error: auth.error };

  const parsed = stickerSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    emoji: formData.get("emoji"),
    imageUrl: formData.get("imageUrl"),
    rarity: formData.get("rarity"),
    probability: formData.get("probability"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, description, emoji, imageUrl, rarity, probability } = parsed.data;
  const service = createServiceClient();

  if (ids.stickerId) {
    const { error } = await service
      .from("stickers")
      .update({
        name,
        description: description || null,
        emoji,
        image_url: imageUrl || null,
        rarity,
      })
      .eq("id", ids.stickerId);
    if (error) return { error: "No se pudo actualizar el sticker." };

    const { error: linkError } = await service
      .from("campaign_stickers")
      .update({ probability })
      .eq("campaign_id", ids.campaignId)
      .eq("sticker_id", ids.stickerId);
    if (linkError) return { error: "No se pudo actualizar la probabilidad." };
  } else {
    const { data: newSticker, error } = await service
      .from("stickers")
      .insert({
        name,
        description: description || null,
        emoji,
        image_url: imageUrl || null,
        rarity,
        base_probability: probability,
      })
      .select("id")
      .single();
    if (error || !newSticker) return { error: "No se pudo crear el sticker." };

    const { error: linkError } = await service
      .from("campaign_stickers")
      .insert({
        campaign_id: ids.campaignId,
        sticker_id: newSticker.id,
        probability,
      });
    if (linkError) {
      return { error: "No se pudo vincular el sticker a la campaña." };
    }
  }

  revalidatePath("/admin/stickers");
  return {};
}

export async function toggleStickerActive(
  campaignStickerId: string,
  nextActive: boolean,
) {
  const auth = await requireStaff(["ADMIN"]);
  if ("error" in auth) return;

  const service = createServiceClient();
  await service
    .from("campaign_stickers")
    .update({ status: nextActive ? "active" : "inactive" })
    .eq("id", campaignStickerId);

  revalidatePath("/admin/stickers");
}
