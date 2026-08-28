import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  role: "ADMIN" | "OPERATOR";
  name: string;
  businessId: string | null;
};

export type AdminSessionResult =
  | { status: "unauthenticated" }
  | { status: "unauthorized" }
  | { status: "ok"; session: AdminSession };

/**
 * Envuelto en React `cache()`: tanto app/admin/layout.tsx como cada
 * page.tsx dentro de app/admin (campaign, customers, prizes, stickers...)
 * necesitan saber quién es el usuario y su negocio, pero sin este cache
 * cada uno repetiría su propio auth.getUser() + su propia consulta a
 * `profiles` — dos viajes de red completos duplicados en CADA navegación
 * dentro del panel admin. `cache()` hace que, dentro de una misma
 * request, la segunda llamada reutilice el resultado de la primera en
 * vez de volver a golpear Supabase.
 */
export const getAdminSession = cache(async (): Promise<AdminSessionResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "unauthenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name, business_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "ADMIN" && profile.role !== "OPERATOR")) {
    return { status: "unauthorized" };
  }

  return {
    status: "ok",
    session: {
      userId: user.id,
      role: profile.role as "ADMIN" | "OPERATOR",
      name: profile.name,
      businessId: profile.business_id,
    },
  };
});
