import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la service_role key. Ignora RLS por completo.
 *
 * Usar SOLO para operaciones que el frontend nunca debe poder decidir por
 * sí mismo: validar un QR, entregar un sticker, desbloquear un premio,
 * registrar un canje. NUNCA importar este archivo desde un Client Component
 * ni exponer su resultado sin filtrar al navegador.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
