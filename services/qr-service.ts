"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateSecureToken } from "@/lib/qr/token";

export type GeneratedQrToken = {
  token: string;
  expiresAt: string;
};

export type GenerateQrResult =
  | { success: true; tokens: GeneratedQrToken[] }
  | { success: false; error: string };

/**
 * Genera un lote de tokens de QR. Verifica que quien llama sea ADMIN u
 * OPERATOR de un negocio con campaña activa antes de escribir nada; la
 * escritura en sí usa service_role porque qr_tokens está bloqueada por RLS.
 */
export async function adminGenerateQrTokens(
  quantity: number,
  expiresInHours: number,
): Promise<GenerateQrResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, business_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "ADMIN" && profile.role !== "OPERATOR")) {
    return { success: false, error: "No tienes permiso para generar códigos QR." };
  }

  if (!profile.business_id) {
    return { success: false, error: "Tu cuenta no está asociada a ningún negocio." };
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return { success: false, error: "La cantidad debe ser un número entre 1 y 100." };
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("business_id", profile.business_id)
    .eq("status", "active")
    .maybeSingle();

  if (!campaign) {
    return { success: false, error: "No hay ninguna campaña activa para generar QR." };
  }

  const serviceClient = createServiceClient();
  const expiresAt = new Date(
    Date.now() + expiresInHours * 60 * 60 * 1000,
  ).toISOString();

  const rows = Array.from({ length: quantity }, () => ({
    business_id: profile.business_id as string,
    campaign_id: campaign.id,
    token: generateSecureToken(),
    expires_at: expiresAt,
  }));

  const { error } = await serviceClient.from("qr_tokens").insert(rows);

  if (error) {
    return { success: false, error: "No se pudieron generar los códigos QR." };
  }

  return {
    success: true,
    tokens: rows.map((r) => ({ token: r.token, expiresAt: r.expires_at })),
  };
}
