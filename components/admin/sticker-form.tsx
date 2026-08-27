"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { saveSticker, type StickerFormState } from "@/services/sticker-admin-actions";
import type { StickerRow } from "@/services/sticker-admin-service";
import type { AdminPrizeRow } from "@/services/prize-admin-service";

const initialState: StickerFormState = {};

const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"] as const;

export function StickerForm({
  campaignId,
  sticker,
  prizes,
}: {
  campaignId: string;
  sticker?: StickerRow;
  prizes: AdminPrizeRow[];
}) {
  const action = saveSticker.bind(null, {
    stickerId: sticker?.id ?? null,
    campaignId,
  });
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [kind, setKind] = useState<"COLLECTIBLE" | "SPECIAL">(
    sticker?.kind ?? "COLLECTIBLE",
  );
  const [preview, setPreview] = useState<string | null>(sticker?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-card"
    >
      <input type="hidden" name="currentImageUrl" value={sticker?.imageUrl ?? ""} />

      <div className="col-span-2">
        <p className="text-sm font-semibold text-ink-700">
          Imagen de la temporada
        </p>
        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-citrus-300 bg-paper-50"
          >
            {preview ? (
              <Image
                src={preview}
                alt="Vista previa"
                width={96}
                height={96}
                className="h-full w-full object-contain"
                unoptimized={preview.startsWith("blob:")}
              />
            ) : (
              <span className="px-2 text-center text-2xl text-citrus-300">+</span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <input
              ref={fileInputRef}
              type="file"
              name="imageFile"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="block w-full text-xs text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-citrus-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
            />
            <p className="mt-1.5 text-[11px] text-ink-500">
              PNG, JPG o WEBP · máximo 5 MB. Sube la imagen de este sticker
              para la temporada.
            </p>
            {state.fieldErrors?.imageFile && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {state.fieldErrors.imageFile}
              </p>
            )}
          </div>
        </div>
      </div>

      <label className="col-span-2 text-sm font-semibold text-ink-700">
        Nombre
        <input
          name="name"
          defaultValue={sticker?.name}
          required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <div className="col-span-2">
        <p className="text-sm font-semibold text-ink-700">Tipo</p>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setKind("COLLECTIBLE")}
            className={`rounded-xl border-2 px-3 py-2 text-left text-sm ${
              kind === "COLLECTIBLE"
                ? "border-citrus-500 bg-citrus-50"
                : "border-black/10"
            }`}
          >
            <span className="block font-bold text-ink-900">🎴 Coleccionable</span>
            <span className="text-xs text-ink-500">
              Va en el álbum. Cae sin repetirse hasta completarlo.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setKind("SPECIAL")}
            className={`rounded-xl border-2 px-3 py-2 text-left text-sm ${
              kind === "SPECIAL" ? "border-foil bg-foil-light/20" : "border-black/10"
            }`}
          >
            <span className="block font-bold text-ink-900">⚡ Especial</span>
            <span className="text-xs text-ink-500">
              No suma al álbum. Cae según su tasa de caída.
            </span>
          </button>
        </div>
        <input type="hidden" name="kind" value={kind} />
      </div>

      {kind === "SPECIAL" && (
        <label className="col-span-2 text-sm font-semibold text-ink-700">
          Premio que otorga
          <select
            name="specialPrizeId"
            defaultValue={sticker?.specialPrizeId ?? ""}
            required
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Selecciona un premio...
            </option>
            {prizes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {prizes.length === 0 && (
            <span className="mt-1 block text-xs font-medium text-red-600">
              Primero crea un premio en la sección Premios.
            </span>
          )}
        </label>
      )}

      <label className="col-span-2 text-sm font-semibold text-ink-700">
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

      <label className="col-span-2 text-sm font-semibold text-ink-700">
        {kind === "SPECIAL" ? "Tasa de caída (%)" : "Probabilidad (no aplica)"}
        <input
          name="probability"
          type="number"
          step="0.01"
          min={0.01}
          max={100}
          defaultValue={sticker?.probability ?? (kind === "SPECIAL" ? 2 : 1)}
          readOnly={kind === "COLLECTIBLE"}
          tabIndex={kind === "COLLECTIBLE" ? -1 : 0}
          required
          className={`mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm ${
            kind === "COLLECTIBLE" ? "pointer-events-none bg-ink-900/5 text-ink-500" : ""
          }`}
        />
        {kind === "SPECIAL" ? (
          <span className="mt-1 block text-xs font-normal text-ink-500">
            Probabilidad de que caiga en CADA escaneo, sin importar los
            demás stickers. Ej: 2 = 2 de cada 100 escaneos.
          </span>
        ) : (
          <span className="mt-1 block text-xs font-normal text-ink-500">
            Los coleccionables se sortean sin repetición hasta completar el
            álbum, así que este número no se usa.
          </span>
        )}
      </label>

      {state.error && (
        <p className="col-span-2 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}
      {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
        <ul className="col-span-2 text-sm font-medium text-red-600">
          {Object.entries(state.fieldErrors)
            .filter(([key]) => key !== "imageFile")
            .map(([key, msg]) => (
              <li key={key}>{msg}</li>
            ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="col-span-2 rounded-xl bg-citrus-500 py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
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
