import type { ReactNode } from "react";
import Image from "next/image";
import { TicketCard } from "@/components/ticket-card";
import { IconGift } from "@/components/icons";
import { Badge, type BadgeTone } from "@/components/ui/badge";

type KnownStatus = "AVAILABLE" | "REDEEMED" | "EXPIRED" | "LOCKED";

const STATUS_LABEL: Record<KnownStatus, { label: string; tone: BadgeTone }> = {
  AVAILABLE: { label: "Disponible", tone: "success" },
  REDEEMED: { label: "Canjeado", tone: "neutral" },
  EXPIRED: { label: "Expirado", tone: "danger" },
  LOCKED: { label: "Bloqueado", tone: "neutral" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

/**
 * LOOP 05: línea de fecha/estado de la tarjeta de premio — solo se muestra
 * cuando el modelo actual realmente tiene ese dato (`customer_prizes.expires_at`
 * / `redeemed_at`); si el premio no tiene fecha de vencimiento, no se inventa
 * una.
 */
function dateLine(
  status: string,
  expiresAt: string | null,
  redeemedAt: string | null,
): string | null {
  if (status === "REDEEMED" && redeemedAt) return `Canjeado el ${formatDate(redeemedAt)}`;
  if (status === "AVAILABLE" && expiresAt) return `Vence el ${formatDate(expiresAt)}`;
  if (status === "EXPIRED" && expiresAt) return `Expiró el ${formatDate(expiresAt)}`;
  return null;
}

/**
 * Tarjeta de premio (LOOP 06 del pack UI): imagen, nombre, condición,
 * estado y CTA. `action` reemplaza el chip de estado cuando el premio se
 * puede canjear (ej. `<RedeemPrizeButton />`).
 *
 * La "condición" depende del origen: un premio de álbum se gana
 * completándolo (`requiredStickers`), uno de sticker especial se gana por
 * suerte — ahí `required_stickers` no aplica y mostrarlo sería engañoso.
 */
export function PrizeCard({
  name,
  description,
  requiredStickers,
  source = "ALBUM",
  imageUrl = null,
  status,
  expiresAt = null,
  redeemedAt = null,
  action,
}: {
  name: string;
  description?: string | null;
  requiredStickers: number;
  source?: "ALBUM" | "SPECIAL";
  imageUrl?: string | null;
  status: string;
  expiresAt?: string | null;
  redeemedAt?: string | null;
  action?: ReactNode;
}) {
  const statusMeta = STATUS_LABEL[status as KnownStatus] ?? STATUS_LABEL.LOCKED;
  const date = dateLine(status, expiresAt, redeemedAt);
  const isSpecial = source === "SPECIAL";
  const locked = status === "LOCKED" || status === "EXPIRED";

  return (
    <TicketCard className="flex flex-wrap items-center gap-3 px-4 pb-4">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${
          isSpecial
            ? "bg-gradient-to-b from-special-100 to-white ring-2 ring-foil/60"
            : "bg-citrus-50"
        } ${locked ? "opacity-70" : ""}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            width={48}
            height={48}
            className="h-[75%] w-[75%] object-contain"
          />
        ) : (
          <IconGift
            className={`h-7 w-7 ${isSpecial ? "text-foil-dark" : "text-citrus-500"}`}
            strokeWidth={1.8}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words font-bold leading-tight text-ink-900">{name}</p>
        {description && (
          <p className="truncate text-xs text-ink-500">{description}</p>
        )}
        {isSpecial ? (
          <p className="text-xs font-semibold text-special-700">
            ⚡ Se gana con un sticker especial
          </p>
        ) : (
          <p className="font-mono text-xs text-ink-500">
            Requiere {requiredStickers} stickers
          </p>
        )}
        {date && <p className="mt-0.5 text-[11px] text-ink-500/80">{date}</p>}
      </div>
      {action ?? <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>}
    </TicketCard>
  );
}
