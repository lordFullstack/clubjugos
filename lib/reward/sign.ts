import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// LOOP 08 — "Ningún valor crítico de recompensa puede depender únicamente
// de query params". Los valores nunca fueron críticos en el sentido de que
// ninguna escritura (sticker entregado, premio otorgado) depende de ellos:
// `redeem_qr_token` ya decidió y grabó todo eso en el servidor ANTES de que
// exista esta URL. El riesgo real era más chico — alguien arma a mano un
// `/reward?prize=1&spPrizeName=X` y ve una pantalla de "ganaste" falsa —
// pero igual es exactamente lo que el spec pide cerrar: en vez de campos
// sueltos manipulables, ahora viaja UN solo token firmado (HMAC-SHA256) con
// expiración corta. Si no coincide la firma o venció, no se muestra nada.

// 5 minutos alcanza de sobra para el redirect inmediato /scan -> /reward,
// pero no deja el link reutilizable después (ej. reenviado a otra persona).
const TTL_MS = 5 * 60 * 1000;

function base64url(input: Buffer | string): string {
  return Buffer.from(input as string).toString("base64url");
}

/**
 * Clave de firma derivada de SUPABASE_SERVICE_ROLE_KEY (server-only, nunca
 * llega al navegador) en vez de reusarla directo: así una firma filtrada no
 * expone ni ayuda a reconstruir la service key, y viceversa. No se agrega
 * una env var nueva porque esta ya es obligatoria y de igual sensibilidad.
 */
function getSigningKey(): Buffer {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada; no se puede firmar el resultado de la recompensa.",
    );
  }
  return createHmac("sha256", serviceKey)
    .update("jugoclub:reward-signing:v1")
    .digest();
}

export type RewardPayload = {
  customerId: string;
  name?: string;
  img?: string | null;
  rarity?: string;
  complete: boolean;
  count: number;
  target: number;
  prize: boolean;
  spName?: string;
  spImg?: string | null;
  spRarity?: string;
  spDup?: boolean;
  spPrize?: boolean;
  spPrizeName?: string | null;
};

type SignedPayload = RewardPayload & { iat: number };

export function signRewardPayload(payload: RewardPayload): string {
  const full: SignedPayload = { ...payload, iat: Date.now() };
  const body = base64url(JSON.stringify(full));
  const sig = base64url(createHmac("sha256", getSigningKey()).update(body).digest());
  return `${body}.${sig}`;
}

/**
 * Devuelve el payload si la firma es válida, no venció, y pertenece al
 * `expectedCustomerId` (la sesión que está mirando `/reward`) — o `null` en
 * cualquier otro caso. Nunca lanza: un token roto/viejo/ajeno simplemente no
 * revela nada, exactamente como si no hubiera reward que mostrar.
 */
export function verifyRewardPayload(
  token: string,
  expectedCustomerId: string,
): RewardPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  let sigBuf: Buffer;
  let expectedBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, "base64url");
    expectedBuf = createHmac("sha256", getSigningKey()).update(body).digest();
  } catch {
    return null;
  }
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  let parsed: SignedPayload;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof parsed.iat !== "number" || Date.now() - parsed.iat > TTL_MS) {
    return null;
  }
  if (parsed.customerId !== expectedCustomerId) {
    return null;
  }

  const { iat: _iat, ...rest } = parsed;
  void _iat;
  return rest;
}
