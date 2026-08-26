"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type ScanResult =
  | {
      success: true;
      sticker: { name: string; imageUrl: string | null; rarity: string } | null;
      collectionComplete: boolean;
      obtainedCount: number;
      completionTarget: number;
      prizeUnlocked: boolean;
      special: {
        name: string;
        imageUrl: string | null;
        rarity: string;
        isDuplicate: boolean;
        prizeUnlocked: boolean;
        prizeName: string | null;
      } | null;
    }
  | { success: false; error: string };

// Nunca se muestra el código técnico crudo al cliente.
const FRIENDLY_SCAN_ERRORS: Record<string, string> = {
  QR_NOT_FOUND: "QR inválido.",
  QR_USED: "Este QR ya fue utilizado.",
  QR_EXPIRED: "Este QR ha expirado.",
  QR_CANCELLED: "Este QR ya no es válido.",
  CAMPAIGN_INACTIVE: "La campaña ya terminó.",
  NO_STICKERS_CONFIGURED:
    "No pudimos procesar tu recompensa. Inténtalo nuevamente.",
  NOT_AUTHENTICATED: "Debes iniciar sesión para escanear un QR.",
};

function friendlyScanError(code: string): string {
  return (
    FRIENDLY_SCAN_ERRORS[code] ??
    "No pudimos procesar tu recompensa. Inténtalo nuevamente."
  );
}

/**
 * Punto de entrada único para canjear un QR. Identifica al cliente con su
 * sesión (cookies), pero delega la validación y entrega del sticker a la
 * función atómica de la base de datos usando el cliente de service_role.
 * El frontend nunca decide si el QR es válido, qué sticker coleccionable
 * toca (se sortea sin repetición mientras falten) ni si cae un especial.
 */
export async function scanQrToken(token: string): Promise<ScanResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: friendlyScanError("NOT_AUTHENTICATED") };
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient.rpc("redeem_qr_token", {
    p_token: token.trim().toUpperCase(),
    p_customer_id: user.id,
  });

  if (error) {
    return {
      success: false,
      error: friendlyScanError("NO_STICKERS_CONFIGURED"),
    };
  }

  if (!data.success) {
    return { success: false, error: friendlyScanError(data.error) };
  }

  return {
    success: true,
    sticker: data.sticker,
    collectionComplete: data.collectionComplete,
    obtainedCount: data.obtainedCount,
    completionTarget: data.completionTarget,
    prizeUnlocked: data.prizeUnlocked,
    special: data.special,
  };
}
