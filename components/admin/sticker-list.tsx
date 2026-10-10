"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { StickerForm } from "./sticker-form";
import { deleteSticker, toggleStickerActive } from "@/services/sticker-admin-actions";
import type { StickerRow } from "@/services/sticker-admin-service";
import type { AdminPrizeRow } from "@/services/prize-admin-service";
import { IconGift } from "@/components/icons";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { Badge } from "@/components/ui/badge";

/**
 * Eliminar con confirmación en dos pasos (inline, sin modal). Solo se ofrece
 * para stickers que ningún cliente tiene; si alguien ya lo tiene aparece
 * "En uso" (editarlo conserva el sticker de los clientes con el arte nuevo).
 */
function DeleteStickerButton({
  stickerId,
  name,
  ownedBy,
}: {
  stickerId: string;
  name: string;
  ownedBy: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSticker(stickerId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirming(false);
    });
  }

  // Si algún cliente ya lo tiene no se ofrece borrarlo (el servidor también lo
  // rechaza): borrarlo lo sacaba de su álbum. Se puede editar o desactivar.
  if (ownedBy > 0) {
    return (
      <span
        title={`${ownedBy} ${ownedBy === 1 ? "cliente lo tiene" : "clientes lo tienen"}: no se puede eliminar. Edítalo o desactívalo.`}
        className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-xs font-semibold text-ink-500"
      >
        🔒 En uso
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Eliminar ${name}`}
        className="inline-flex min-h-11 items-center shrink-0 px-2 text-xs font-semibold text-red-700"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
      <p className="flex-1 font-semibold">
        ¿Eliminar «{name}»? Nadie lo tiene todavía. No se puede deshacer.
      </p>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-red-700 px-4 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Eliminando..." : "Sí, eliminar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="inline-flex min-h-11 items-center px-2 font-semibold text-ink-500"
      >
        Cancelar
      </button>
      {error && <p className="w-full font-semibold">{error}</p>}
    </div>
  );
}

export function StickerList({
  campaignId,
  stickers,
  prizes,
}: {
  campaignId: string;
  stickers: StickerRow[];
  prizes: AdminPrizeRow[];
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const prizeName = (id: string | null) =>
    prizes.find((p) => p.id === id)?.name ?? "Premio eliminado";

  return (
    <div className="mt-6 space-y-3">
      {creating ? (
        <div>
          <StickerForm campaignId={campaignId} prizes={prizes} />
          <button
            onClick={() => setCreating(false)}
            className="mt-1 inline-flex min-h-11 items-center px-1 text-sm font-semibold text-ink-500"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="min-h-11 rounded-full bg-citrus-700 px-5 py-2.5 text-sm font-bold text-white"
        >
          + Nuevo sticker
        </button>
      )}

      <div className="space-y-2">
        {stickers.map((sticker) =>
          editingId === sticker.id ? (
            <div key={sticker.id}>
              <StickerForm campaignId={campaignId} sticker={sticker} prizes={prizes} />
              <button
                onClick={() => setEditingId(null)}
                className="mt-1 inline-flex min-h-11 items-center px-1 text-sm font-semibold text-ink-500"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div
              key={sticker.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-citrus-50">
                {sticker.imageUrl ? (
                  <Image
                    src={sticker.imageUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <IconGift className="h-6 w-6 text-citrus-400" strokeWidth={1.6} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink-900">
                  {sticker.name}
                </p>
                {sticker.kind === "SPECIAL" ? (
                  <p className="text-xs text-ink-500">
                    ⚡ {sticker.probability}% de caída · premia:{" "}
                    {prizeName(sticker.specialPrizeId)}
                  </p>
                ) : (
                  <p className="text-xs text-ink-500">
                    🎴 Coleccionable — sin repetición
                  </p>
                )}
                <p className="text-xs text-ink-500">
                  {sticker.ownedByCustomers === 0
                    ? "Nadie lo tiene todavía"
                    : sticker.ownedByCustomers === 1
                      ? "1 cliente lo tiene"
                      : `${sticker.ownedByCustomers} clientes lo tienen`}
                </p>
              </div>
              {/* En móvil los controles bajan a su propia línea para no apretar el nombre. */}
              <div className="flex w-full flex-wrap items-center gap-1 border-t border-ink-900/5 pt-2 sm:w-auto sm:flex-nowrap sm:border-0 sm:pt-0">
                <RarityBadge rarity={sticker.rarity} />
                <button
                  type="button"
                  onClick={() =>
                    toggleStickerActive(sticker.campaignStickerId, !sticker.active)
                  }
                  className="inline-flex min-h-11 items-center shrink-0 px-1"
                >
                  <Badge tone={sticker.active ? "success" : "neutral"}>
                    {sticker.active ? "Activo" : "Inactivo"}
                  </Badge>
                </button>
                <button
                  onClick={() => setEditingId(sticker.id)}
                  className="inline-flex min-h-11 items-center shrink-0 px-2 text-xs font-semibold text-citrus-700"
                >
                  Editar
                </button>
                <DeleteStickerButton
                  stickerId={sticker.id}
                  name={sticker.name}
                  ownedBy={sticker.ownedByCustomers}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
