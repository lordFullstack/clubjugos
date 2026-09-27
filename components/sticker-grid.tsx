import type { CollectionSticker } from "@/services/customer-service";
import { StickerTile } from "@/components/sticker-tile";

export function StickerGrid({
  stickers,
  size = "md",
}: {
  stickers: CollectionSticker[];
  size?: "sm" | "md";
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {stickers.map((sticker) => (
        <StickerTile key={sticker.id} sticker={sticker} size={size} />
      ))}
    </div>
  );
}
