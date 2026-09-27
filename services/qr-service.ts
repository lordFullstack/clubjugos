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

export type QrTokenStatus = "AVAILABLE" | "USED" | "EXPIRED" | "CANCELLED";

export type QrTokenRow = {
  token: string;
  /** Estado real en la base. Ver `displayStatus` para lo que se muestra. */
  status: QrTokenStatus;
  /**
   * `qr_tokens.status` solo pasa a EXPIRED cuando alguien intenta usarlo
   * (ver migración 008/014, sección del QR vencido). Un token que nadie
   * escaneó nunca se actualiza solo, así que acá calculamos el estado que
   * el admin realmente necesita ver: si ya pasó `expiresAt`, se muestra
   * como expirado aunque la fila todavía diga AVAILABLE. Es solo de
   * lectura — no escribe nada, no le miente al admin sobre lo que hay en
   * la base, solo interpreta correctamente lo que ya está.
   */
  displayStatus: QrTokenStatus;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

/**
 * LOOP 07 — lista de QR recientes del negocio, con su estado (disponible /
 * usado / expirado / cancelado), para la sección "estado" que pide el
 * pack. `qr_tokens` no tiene ninguna policy de RLS para anon/authenticated
 * (a propósito, ver migración 004): por eso esta lectura hace su propio
 * chequeo de rol antes de usar el cliente de service_role, igual que ya
 * hace `adminGenerateQrTokens`.
 */
export async function getRecentQrTokens(limit = 30): Promise<QrTokenRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, business_id")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    (profile.role !== "ADMIN" && profile.role !== "OPERATOR") ||
    !profile.business_id
  ) {
    return [];
  }

  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from("qr_tokens")
    .select("token, status, expires_at, used_at, created_at")
    .eq("business_id", profile.business_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const now = Date.now();

  return (data ?? []).map((row) => {
    const status = row.status as QrTokenStatus;
    const isStaleUnused = status === "AVAILABLE" && new Date(row.expires_at).getTime() < now;
    return {
      token: row.token,
      status,
      displayStatus: isStaleUnused ? "EXPIRED" : status,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
      createdAt: row.created_at,
    };
  });
}
