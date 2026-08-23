import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre completo")
    .max(80, "El nombre es demasiado largo"),
  phone: z
    .string()
    .trim()
    .min(7, "Ingresa un teléfono válido")
    .max(20, "El teléfono es demasiado largo")
    .regex(/^[0-9+\-\s()]+$/, "Solo se permiten números y símbolos de teléfono"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresa un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingresa un email válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
