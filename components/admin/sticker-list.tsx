"use client";

import { useState } from "react";
import Image from "next/image";
import { StickerForm } from "./sticker-form";
import { toggleStickerActive } from "@/services/sticker-admin-actions";
import type { StickerRow } from "@/services/sticker-admin-service";
import type { AdminPrizeRow } from "@/services/prize-admin-service";
import { IconGift } from "@/components/icons";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { Badge } from "@/components/ui/badge";

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
            className="mt-2 text-sm font-semibold text-ink-500"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="rounded-xl bg-citrus-500 px-4 py-2.5 text-sm font-bold text-white"
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
                className="mt-2 text-sm font-semibold text-ink-500"
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
              </div>
              <RarityBadge rarity={sticker.rarity} />
              <button
                type="button"
                onClick={() =>
                  toggleStickerActive(sticker.campaignStickerId, !sticker.active)
                }
                className="shrink-0"
              >
                <Badge tone={sticker.active ? "success" : "neutral"}>
                  {sticker.active ? "Activo" : "Inactivo"}
                </Badge>
              </button>
              <button
                onClick={() => setEditingId(sticker.id)}
                className="shrink-0 text-xs font-semibold text-citrus-600"
              >
                Editar
              </button>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
