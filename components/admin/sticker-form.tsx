"use client";

import { useActionState } from "react";
import { saveSticker, type StickerFormState } from "@/services/sticker-admin-actions";
import type { StickerRow } from "@/services/sticker-admin-service";

const initialState: StickerFormState = {};

const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"] as const;

export function StickerForm({
  campaignId,
  sticker,
}: {
  campaignId: string;
  sticker?: StickerRow;
}) {
  const action = saveSticker.bind(null, {
    stickerId: sticker?.id ?? null,
    campaignId,
  });
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
          defaultValue={sticker?.name}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Emoji
        <input
          name="emoji"
          defaultValue={sticker?.emoji ?? ""}
          required
          maxLength={4}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Rareza
        <select
          name="rarity"
          defaultValue={sticker?.rarity ?? "COMMON"}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        >
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="col-span-2 text-sm font-semibold text-ink-700">
        Descripción
        <textarea
          name="description"
          defaultValue={sticker?.description ?? ""}
          rows={2}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-sm font-semibold text-ink-700">
        Probabilidad (%)
        <input
          name="probability"
          type="number"
          step="0.01"
          min={0.01}
          max={100}
          defaultValue={sticker?.probability ?? 10}
          required
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
        {isPending
          ? "Guardando..."
          : sticker
            ? "Guardar cambios"
            : "Crear sticker"}
      </button>
    </form>
  );
}
