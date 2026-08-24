import { createClient } from "@/lib/supabase/server";

export type StaffRole = "ADMIN" | "OPERATOR";

export type AuthorizedStaff = {
  userId: string;
  role: StaffRole;
  businessId: string;
};

export type AuthorizationError = { error: string };

/**
 * Verifica que quien invoca una Server Action del panel admin tenga sesión
 * y el rol correcto para su negocio. Se usa al inicio de toda mutación
 * administrativa (crear/editar campaña, stickers, premios, generar QR).
 */
export async function requireStaff(
  allowedRoles: StaffRole[] = ["ADMIN", "OPERATOR"],
): Promise<AuthorizedStaff | AuthorizationError> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, business_id")
    .eq("id", user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role as StaffRole)) {
    return { error: "No tienes permiso para realizar esta acción." };
  }

  if (!profile.business_id) {
    return { error: "Tu cuenta no está asociada a ningún negocio." };
  }

  return {
    userId: user.id,
    role: profile.role as StaffRole,
    businessId: profile.business_id,
  };
}
