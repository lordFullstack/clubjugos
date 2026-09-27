"use client";

import Image from "next/image";
import type { CollectionSticker } from "@/services/customer-service";
import { Modal } from "@/components/ui/modal";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { Button } from "@/components/ui/button";
import { IconAlbum } from "@/components/icons";
import { getRarityMeta } from "@/components/ui/rarity";

/**
 * Detalle de un sticker del álbum (LOOP 04: "al tocar un sticker obtenido,
 * abrir modal de detalle").
 *
 * Si el sticker NO está obtenido, el modal muestra un estado bloqueado
 * genérico — nunca el nombre, la imagen ni la rareza real, aunque el objeto
 * `sticker` los traiga (la API de campaña trae el catálogo completo para
 * poder pintar el grid; ocultar lo no obtenido es responsabilidad de esta
 * capa de UI, igual que ya hace `StickerTile` con el aro de color).
 */
export function StickerDetailModal({
  sticker,
  onClose,
}: {
  sticker: CollectionSticker;
  onClose: () => void;
}) {
  if (!sticker.obtained) {
    return (
      <Modal open onClose={onClose} title="Sticker bloqueado" className="max-w-xs">
        <div className="rounded-4xl bg-white p-6 text-center shadow-card">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-ink-900/5 text-ink-900/15">
            <span className="font-display text-3xl">?</span>
          </div>
          <p className="mt-3 font-semibold text-ink-900">Todavía no tienes este sticker</p>
          <p className="mt-1 text-sm text-ink-500">
            Sigue escaneando en cada compra para descubrir qué es.
          </p>
          <Button variant="secondary" className="mt-5" onClick={onClose}>
            CERRAR
          </Button>
        </div>
      </Modal>
    );
  }

  const meta = getRarityMeta(sticker.rarity);

  return (
    <Modal open onClose={onClose} title={sticker.name} className="max-w-xs">
      <div className="rounded-4xl bg-white p-6 text-center shadow-card">
        <div
          className={`relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-4xl bg-paper-50 ring-4 ${meta.ring} ${meta.glow}`}
        >
          {sticker.image_url ? (
            <Image
              src={sticker.image_url}
              alt={sticker.name}
              width={128}
              height={128}
              className="object-contain"
            />
          ) : (
            <IconAlbum className="h-12 w-12 text-citrus-300" strokeWidth={1.4} />
          )}
        </div>

        <div className="mt-3">
          <RarityBadge rarity={sticker.rarity} />
          <p className="mt-1 font-display text-xl font-extrabold text-ink-900">
            {sticker.name}
          </p>
        </div>

        {sticker.duplicateCount > 0 && (
          <p className="mt-2 font-mono text-xs font-bold text-ink-500">
            Tienes {sticker.duplicateCount + 1} copias
          </p>
        )}

        <Button variant="secondary" className="mt-5" onClick={onClose}>
          CERRAR
        </Button>
      </div>
    </Modal>
  );
}
