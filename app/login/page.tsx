"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { loginCustomer, type AuthFormState } from "@/services/auth-service";

const initialState: AuthFormState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginCustomer,
    initialState,
  );

  return (
    <main className="flex min-h-screen flex-col justify-center bg-brand-50 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-5xl" role="img" aria-label="Vaso de jugo">
            🥤
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-900">
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Inicia sesión para ver tu colección.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
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
            autoComplete="current-password"
            placeholder="Tu contraseña"
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
            className="w-full rounded-2xl bg-brand-500 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98] active:bg-brand-600 disabled:opacity-60"
          >
            {isPending ? "Ingresando..." : "INICIAR SESIÓN"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-brand-600">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
