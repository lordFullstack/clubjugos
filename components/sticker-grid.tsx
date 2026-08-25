import Image from "next/image";
import type { CollectionSticker } from "@/services/customer-service";

const RARITY_RING: Record<string, string> = {
  COMMON: "ring-ink-900/10",
  UNCOMMON: "ring-jade-500/40",
  RARE: "ring-sky-500/40",
  EPIC: "ring-guava/50",
  LEGENDARY: "ring-foil/70",
};

const RARITY_GLOW: Record<string, string> = {
  LEGENDARY: "shadow-[0_0_0_3px_rgba(200,155,60,0.25)]",
  EPIC: "shadow-[0_0_0_3px_rgba(226,62,119,0.18)]",
};

export function StickerGrid({
  stickers,
  size = "md",
}: {
  stickers: CollectionSticker[];
  size?: "sm" | "md";
}) {
  const cellClass = size === "sm" ? "h-14 w-14" : "h-20 w-20";
  const imgSize = size === "sm" ? 32 : 48;

  return (
    <div className="grid grid-cols-4 gap-3">
      {stickers.map((sticker) => (
        <div key={sticker.id} className="flex flex-col items-center gap-1">
          <div
            className={`relative flex ${cellClass} items-center justify-center overflow-hidden rounded-2xl bg-white ring-2 ${
              RARITY_RING[sticker.rarity] ?? RARITY_RING.COMMON
            } ${RARITY_GLOW[sticker.rarity] ?? ""} ${
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
                <span className={size === "sm" ? "text-2xl" : "text-3xl"}>🧃</span>
              )
            ) : (
              <span className="font-display text-ink-900/15" aria-label="Sticker no obtenido">
                ?
              </span>
            )}
          </div>
          {sticker.obtained && sticker.duplicateCount > 0 && (
            <span className="rounded-full bg-ink-900/5 px-1.5 font-mono text-[10px] font-bold text-ink-500">
              x{sticker.duplicateCount + 1}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
