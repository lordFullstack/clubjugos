"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-role";
import { createServiceClient } from "@/lib/supabase/service";

const prizeSchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre").max(120),
  description: z.string().trim().max(300).optional(),
  required_stickers: z.coerce
    .number()
    .int()
    .min(1, "Debe ser al menos 1")
    .max(50),
  max_value: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .refine(
      (v) => v === null || (!Number.isNaN(v) && v >= 0),
      "Debe ser un número válido",
    ),
  expires_days: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .refine(
      (v) => v === null || (Number.isInteger(v) && v >= 1),
      "Debe ser un número entero mayor a 0",
    ),
});

export type PrizeFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function savePrize(
  prizeId: string | null,
  _prevState: PrizeFormState,
  formData: FormData,
): Promise<PrizeFormState> {
  const auth = await requireStaff(["ADMIN"]);
  if ("error" in auth) return { error: auth.error };

  const parsed = prizeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    required_stickers: formData.get("required_stickers"),
    max_value: formData.get("max_value"),
    expires_days: formData.get("expires_days"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const payload = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    required_stickers: parsed.data.required_stickers,
    max_value: parsed.data.max_value,
    expires_days: parsed.data.expires_days,
  };

  const service = createServiceClient();

  if (prizeId) {
    const { error } = await service
      .from("prizes")
      .update(payload)
      .eq("id", prizeId)
      .eq("business_id", auth.businessId);
    if (error) return { error: "No se pudo guardar el premio." };
  } else {
    const { data: campaign } = await service
      .from("campaigns")
      .select("id")
      .eq("business_id", auth.businessId)
      .eq("status", "active")
      .maybeSingle();

    const { error } = await service.from("prizes").insert({
      ...payload,
      business_id: auth.businessId,
      campaign_id: campaign?.id ?? null,
    });
    if (error) return { error: "No se pudo crear el premio." };
  }

  revalidatePath("/admin/prizes");
  return {};
}

export async function togglePrizeActive(prizeId: string, nextActive: boolean) {
  const auth = await requireStaff(["ADMIN"]);
  if ("error" in auth) return;

  const service = createServiceClient();
  await service
    .from("prizes")
    .update({ status: nextActive ? "active" : "inactive" })
    .eq("id", prizeId);

  revalidatePath("/admin/prizes");
}
