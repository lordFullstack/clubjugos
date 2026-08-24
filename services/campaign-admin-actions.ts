"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-role";
import { createServiceClient } from "@/lib/supabase/service";

const campaignSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresa un nombre").max(120),
    description: z.string().trim().max(500).optional(),
    start_date: z.string().min(1, "Ingresa la fecha de inicio"),
    end_date: z.string().min(1, "Ingresa la fecha final"),
    completion_target: z.coerce
      .number()
      .int()
      .min(1, "Debe ser al menos 1")
      .max(50),
    status: z.enum(["draft", "active", "finished", "archived"]),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "La fecha final debe ser posterior a la inicial",
    path: ["end_date"],
  });

export type CampaignFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveCampaign(
  campaignId: string | null,
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const auth = await requireStaff(["ADMIN"]);
  if ("error" in auth) return { error: auth.error };

  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    completion_target: formData.get("completion_target"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const service = createServiceClient();

  // Solo puede haber una campaña activa por negocio a la vez.
  if (parsed.data.status === "active") {
    await service
      .from("campaigns")
      .update({ status: "finished" })
      .eq("business_id", auth.businessId)
      .eq("status", "active")
      .neq("id", campaignId ?? "00000000-0000-0000-0000-000000000000");
  }

  if (campaignId) {
    const { error } = await service
      .from("campaigns")
      .update(parsed.data)
      .eq("id", campaignId)
      .eq("business_id", auth.businessId);
    if (error) return { error: "No se pudo guardar la campaña." };
  } else {
    const { error } = await service
      .from("campaigns")
      .insert({ ...parsed.data, business_id: auth.businessId });
    if (error) return { error: "No se pudo crear la campaña." };
  }

  revalidatePath("/admin/campaign");
  return {};
}
