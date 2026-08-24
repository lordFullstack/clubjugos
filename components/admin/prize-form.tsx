"use client";

import { useActionState } from "react";
import { savePrize, type PrizeFormState } from "@/services/prize-admin-actions";
import type { AdminPrizeRow } from "@/services/prize-admin-service";

const initialState: PrizeFormState = {};

export function PrizeForm({ prize }: { prize?: AdminPrizeRow }) {
  const action = savePrize.bind(null, prize?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-card"
    >
      <label className="col-span-2 text-sm font-semibold text-ink-700">
        Nombre
        <input
          name="name"
          defaultValue={prize?.name}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="col-span-2 text-sm font-semibold text-ink-700">
        Descripción
        <textarea
          name="description"
          defaultValue={prize?.description ?? ""}
          rows={2}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Stickers necesarios
        <input
          name="required_stickers"
          type="number"
          min={1}
          max={50}
          defaultValue={prize?.required_stickers ?? 8}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Valor máximo ($)
        <input
          name="max_value"
          type="number"
          min={0}
          step="0.01"
          defaultValue={prize?.max_value ?? ""}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="col-span-2 text-sm font-semibold text-ink-700">
        Vigencia una vez desbloqueado (días)
        <input
          name="expires_days"
          type="number"
          min={1}
          defaultValue={prize?.expires_days ?? 30}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      {state.error && (
        <p className="col-span-2 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}
      {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
        <ul className="col-span-2 text-sm font-medium text-red-600">
          {Object.values(state.fieldErrors).map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="col-span-2 rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "Guardando..." : prize ? "Guardar cambios" : "Crear premio"}
      </button>
    </form>
  );
}
