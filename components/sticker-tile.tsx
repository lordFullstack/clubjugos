import Image from "next/image";
import type { CollectionSticker } from "@/services/customer-service";
import { IconAlbum } from "@/components/icons";
import { getRarityMeta } from "@/components/ui/rarity";

/**
 * Una celda individual del álbum. Extraída de `sticker-grid.tsx` (LOOP 01)
 * para poder reutilizarla en un futuro modal de detalle (LOOP 04) sin
 * duplicar el markup de la miniatura.
 *
 * Corrige un hallazgo del AUDIT: antes, el `ring` de color de rareza se
 * aplicaba según `sticker.rarity` sin mirar `obtained`, así que un sticker
 * que el cliente todavía no tiene ya delataba visualmente si era
 * RARE/EPIC/LEGENDARY por el color de su borde. Un slot bloqueado ahora
 * siempre usa el aro neutro de COMMON, sin importar la rareza real.
 */
export function StickerTile({
  sticker,
  size = "md",
  onClick,
}: {
  sticker: CollectionSticker;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const cellClass = size === "sm" ? "h-14 w-14" : "h-20 w-20";
  const imgSize = size === "sm" ? 32 : 48;
  const meta = sticker.obtained ? getRarityMeta(sticker.rarity) : null;

  const tile = (
    <div
      className={`relative flex ${cellClass} items-center justify-center overflow-hidden rounded-2xl bg-white ring-2 ${
        meta ? meta.ring : "ring-ink-900/10"
      } ${meta ? meta.glow : ""} ${
        sticker.obtained ? "animate-pop-in shadow-card" : "opacity-90"
      }`}
    >
      {sticker.obtained ? (
        sticker.image_url ? (
          <Image
            src={sticker.image_url}
            alt={sticker.name}
            width={imgSize}
            height={imgSize}
            className="object-contain"
          />
        ) : (
          <IconAlbum
            className={size === "sm" ? "h-6 w-6 text-citrus-300" : "h-8 w-8 text-citrus-300"}
            strokeWidth={1.4}
          />
        )
      ) : (
        <span className="font-display text-ink-900/15" aria-label="Sticker no obtenido">
          ?
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={sticker.obtained ? `Ver ${sticker.name}` : "Sticker bloqueado"}
          className="min-h-11 min-w-11 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citrus-500"
        >
          {tile}
        </button>
      ) : (
        tile
      )}
      {sticker.obtained && sticker.duplicateCount > 0 && (
        <span className="rounded-full bg-ink-900/5 px-1.5 font-mono text-[10px] font-bold text-ink-500">
          x{sticker.duplicateCount + 1}
        </span>
      )}
    </div>
  );
}
