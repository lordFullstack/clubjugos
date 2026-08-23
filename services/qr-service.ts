"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { generateSecureToken } from "@/lib/qr/token";

export type GenerateQrTokensInput = {
  businessId: string;
  campaignId: string;
  quantity: number;
  expiresInHours: number;
};

export type GeneratedQrToken = {
  token: string;
  expiresAt: string;
};

/**
 * Genera un lote de tokens de QR criptográficamente seguros y de un solo uso.
 * Usa el cliente de service_role porque qr_tokens está completamente
 * bloqueada por RLS para cualquier rol que no sea el backend.
 */
export async function generateQrTokens(
  input: GenerateQrTokensInput,
): Promise<GeneratedQrToken[]> {
  const supabase = createServiceClient();
  const expiresAt = new Date(
    Date.now() + input.expiresInHours * 60 * 60 * 1000,
  ).toISOString();

  const rows = Array.from({ length: input.quantity }, () => ({
    business_id: input.businessId,
    campaign_id: input.campaignId,
    token: generateSecureToken(),
    expires_at: expiresAt,
  }));

  const { error } = await supabase.from("qr_tokens").insert(rows);

  if (error) {
    throw new Error("No se pudieron generar los códigos QR.");
  }

  return rows.map((r) => ({ token: r.token, expiresAt: r.expires_at }));
}
