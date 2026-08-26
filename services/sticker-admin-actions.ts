"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-role";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

const stickerSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresa un nombre").max(60),
    description: z.string().trim().max(300).optional(),
    rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
    kind: z.enum(["COLLECTIBLE", "SPECIAL"]),
    specialPrizeId: z.string().trim().optional(),
    currentImageUrl: z.string().trim().optional(),
    // Coleccionable: se ignora (sorteo sin repetición). Especial: tasa de
    // caída real en %, evaluada de forma independiente en cada escaneo.
    probability: z.coerce
      .number()
      .min(0.01, "Debe ser mayor a 0")
      .max(100, "No puede ser mayor a 100"),
  })
  .refine((data) => data.kind !== "SPECIAL" || !!data.specialPrizeId, {
    message: "Elige el premio que otorga este sticker especial",
    path: ["specialPrizeId"],
  });

export type StickerFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function uploadStickerImage(
  file: File,
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "La imagen debe ser PNG, JPG o WEBP." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "La imagen no puede pesar más de 5 MB." };
  }

  const service = createServiceClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await service.storage
    .from("stickers")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: "No se pudo subir la imagen." };

  const { data } = service.storage.from("stickers").getPublicUrl(path);
  return { url: data.publicUrl };
}

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
    rarity: formData.get("rarity"),
    kind: formData.get("kind"),
    specialPrizeId: formData.get("specialPrizeId"),
    currentImageUrl: formData.get("currentImageUrl"),
    probability: formData.get("probability"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const {
    name,
    description,
    rarity,
    kind,
    specialPrizeId,
    currentImageUrl,
    probability,
  } = parsed.data;

  let imageUrl = currentImageUrl || null;
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadStickerImage(imageFile);
    if ("error" in uploaded) return { error: uploaded.error };
    imageUrl = uploaded.url;
  }

  if (!imageUrl) {
    return { fieldErrors: { imageFile: "Sube una imagen para el sticker." } };
  }

  const service = createServiceClient();
  const resolvedSpecialPrizeId = kind === "SPECIAL" ? specialPrizeId || null : null;

  if (ids.stickerId) {
    const { error } = await service
      .from("stickers")
      .update({
        name,
        description: description || null,
        image_url: imageUrl,
        rarity,
        kind,
        special_prize_id: resolvedSpecialPrizeId,
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
        image_url: imageUrl,
        rarity,
        kind,
        special_prize_id: resolvedSpecialPrizeId,
        base_probability: probability,
      })
      .select("id")
      .single();
    if (error || !newSticker) return { error: "No se pudo crear el sticker." };

    const { error: linkError } = await service.from("campaign_stickers").insert({
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
