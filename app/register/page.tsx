"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { registerCustomer, type AuthFormState } from "@/services/auth-service";

const initialState: AuthFormState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerCustomer,
    initialState,
  );

  return (
    <main className="flex min-h-screen flex-col justify-center bg-paper-100 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border-2 border-dashed border-citrus-400 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-citrus-600">
            JugoClub
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Empieza a coleccionar stickers hoy mismo.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <FormField
            label="Nombre completo"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Juan Pérez"
            error={state.fieldErrors?.name}
          />
          <FormField
            label="Teléfono"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="300 123 4567"
            error={state.fieldErrors?.phone}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            error={state.fieldErrors?.email}
          />
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={state.fieldErrors?.password}
          />

          {state.error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-gradient-to-b from-citrus-400 to-citrus-600 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? "Creando cuenta..." : "CREAR CUENTA"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-bold text-citrus-600">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
