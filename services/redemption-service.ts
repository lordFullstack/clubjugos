"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type RedeemResult =
  | { success: true; prizeName: string }
  | { success: false; error: string };

const FRIENDLY_REDEMPTION_ERRORS: Record<string, string> = {
  PRIZE_NOT_FOUND: "No pudimos encontrar este premio.",
  PRIZE_ALREADY_REDEEMED: "Este premio ya fue canjeado.",
  PRIZE_EXPIRED: "Este premio ha expirado.",
  NOT_AUTHENTICATED: "Debes iniciar sesión para canjear un premio.",
};

function friendlyRedemptionError(code: string): string {
  return (
    FRIENDLY_REDEMPTION_ERRORS[code] ??
    "No pudimos procesar tu canje. Inténtalo nuevamente."
  );
}

/**
 * Canjea un premio del cliente. Toda la validación (dueño, estado,
 * expiración) ocurre en una función atómica de la base de datos —
 * el cliente nunca marca por sí mismo un premio como usado.
 *
 * NOTA: operator_id queda en null hasta la Fase 10, cuando exista login
 * de staff. Por ahora el canje lo confirma el propio cliente en pantalla
 * y el negocio lo valida visualmente en el mostrador.
 */
export async function redeemPrize(customerPrizeId: string): Promise<RedeemResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: friendlyRedemptionError("NOT_AUTHENTICATED") };
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient.rpc("redeem_prize", {
    p_customer_prize_id: customerPrizeId,
    p_customer_id: user.id,
    p_operator_id: null,
  });

  if (error || !data.success) {
    return {
      success: false,
      error: friendlyRedemptionError(data?.error ?? "UNKNOWN"),
    };
  }

  revalidatePath("/prizes");
  return { success: true, prizeName: data.prizeName };
}
