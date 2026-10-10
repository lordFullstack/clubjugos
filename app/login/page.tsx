"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BusinessLogo } from "@/components/business-logo";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";
import { loginCustomer, type AuthFormState } from "@/services/auth-service";

const initialState: AuthFormState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginCustomer,
    initialState,
  );

  return (
    <main className="flex min-h-screen flex-col justify-center bg-paper-100 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <BusinessLogo size="md" priority className="mx-auto mb-4" />
          <span className="inline-block rounded-full border-2 border-dashed border-citrus-400 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-citrus-700">
            JugoClub
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Inicia sesión para ver tu álbum.
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
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Ingresando..." : "INICIAR SESIÓN"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/register" className="font-bold text-citrus-700">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
