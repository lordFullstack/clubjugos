import Image from "next/image";
import type { CollectionSticker } from "@/services/customer-service";

const RARITY_RING: Record<string, string> = {
  COMMON: "ring-ink-500/10",
  UNCOMMON: "ring-tropical-lime/50",
  RARE: "ring-sky-400/50",
  EPIC: "ring-tropical-grape/50",
  LEGENDARY: "ring-tropical-mango/60",
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
            className={`flex ${cellClass} items-center justify-center rounded-2xl bg-white shadow-card ring-2 ${
              RARITY_RING[sticker.rarity] ?? RARITY_RING.COMMON
            } ${sticker.obtained ? "animate-pop-in" : ""}`}
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
              <span className="text-ink-500/30" aria-label="Sticker no obtenido">
                ❓
              </span>
            )}
          </div>
          {sticker.obtained && sticker.duplicateCount > 0 && (
            <span className="rounded-full bg-ink-900/5 px-1.5 text-[10px] font-bold text-ink-500">
              x{sticker.duplicateCount + 1}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
