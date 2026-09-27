"use client";

import { useState } from "react";
import type { CollectionSticker } from "@/services/customer-service";
import { StickerTile } from "@/components/sticker-tile";
import { StickerDetailModal } from "@/components/sticker-detail-modal";

/**
 * Versión interactiva de `StickerGrid` para la pantalla de Álbum (LOOP 04).
 * `StickerGrid` (usado en Home, a tamaño "sm") sigue siendo estático a
 * propósito: el detalle por sticker es un comportamiento propio del álbum,
 * no de la vista compacta de Home.
 */
export function StickerAlbumGrid({ stickers }: { stickers: CollectionSticker[] }) {
  const [selected, setSelected] = useState<CollectionSticker | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        {stickers.map((sticker) => (
          <StickerTile
            key={sticker.id}
            sticker={sticker}
            size="md"
            onClick={() => setSelected(sticker)}
          />
        ))}
      </div>

      {selected && (
        <StickerDetailModal sticker={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
