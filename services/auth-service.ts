"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

// Traduce errores técnicos de Supabase a mensajes que un cliente puede entender.
// Nunca se debe mostrar el mensaje crudo del proveedor al usuario final.
const FRIENDLY_ERRORS: Record<string, string> = {
  "User already registered":
    "Ya existe una cuenta con este email. Intenta iniciar sesión.",
  "Invalid login credentials": "Email o contraseña incorrectos.",
  "Email not confirmed":
    "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
};

function friendlyMessage(message: string): string {
  return (
    FRIENDLY_ERRORS[message] ??
    "No pudimos procesar tu solicitud. Inténtalo nuevamente."
  );
}

function extractFieldErrors(
  error: import("zod").ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function registerCustomer(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: extractFieldErrors(parsed.error) };
  }

  const { name, phone, email, password } = parsed.data;
  const supabase = await createClient();

  // El rol se fija en el servidor. El cliente nunca puede elegir su propio rol.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        role: "CUSTOMER",
      },
    },
  });

  if (error) {
    return { error: friendlyMessage(error.message) };
  }

  redirect("/home");
}

export async function loginCustomer(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: extractFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: friendlyMessage(error.message) };
  }

  redirect("/home");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
