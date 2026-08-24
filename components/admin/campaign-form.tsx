"use client";

import { useActionState } from "react";
import {
  saveCampaign,
  type CampaignFormState,
} from "@/services/campaign-admin-actions";
import type { CampaignRow } from "@/services/campaign-service";

const initialState: CampaignFormState = {};

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activa" },
  { value: "finished", label: "Finalizada" },
  { value: "archived", label: "Archivada" },
] as const;

export function CampaignForm({ campaign }: { campaign: CampaignRow | null }) {
  const action = saveCampaign.bind(null, campaign?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-card sm:grid-cols-2"
    >
      <label className="col-span-full text-sm font-semibold text-ink-700">
        Nombre
        <input
          name="name"
          defaultValue={campaign?.name}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="col-span-full text-sm font-semibold text-ink-700">
        Descripción
        <textarea
          name="description"
          defaultValue={campaign?.description ?? ""}
          rows={2}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Fecha de inicio
        <input
          type="date"
          name="start_date"
          defaultValue={campaign?.start_date}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Fecha final
        <input
          type="date"
          name="end_date"
          defaultValue={campaign?.end_date}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
        {state.fieldErrors?.end_date && (
          <span className="mt-1 block text-xs font-medium text-red-600">
            {state.fieldErrors.end_date}
          </span>
        )}
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Stickers necesarios
        <input
          type="number"
          name="completion_target"
          min={1}
          max={50}
          defaultValue={campaign?.completion_target ?? 8}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Estado
        <select
          name="status"
          defaultValue={campaign?.status ?? "draft"}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {state.error && (
        <p className="col-span-full text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="col-span-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {isPending
          ? "Guardando..."
          : campaign
            ? "GUARDAR CAMBIOS"
            : "CREAR TEMPORADA"}
      </button>
    </form>
  );
}
