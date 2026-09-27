import type { ReactNode } from "react";
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
 * Tarjeta de premio reutilizable (extraída de `app/prizes/page.tsx`).
 * `action` reemplaza el chip de estado cuando el premio se puede canjear
 * (ej. `<RedeemPrizeButton />`); si no se pasa, se muestra el chip de status.
 */
export function PrizeCard({
  name,
  description,
  requiredStickers,
  status,
  expiresAt = null,
  redeemedAt = null,
  action,
}: {
  name: string;
  description?: string | null;
  requiredStickers: number;
  status: string;
  expiresAt?: string | null;
  redeemedAt?: string | null;
  action?: ReactNode;
}) {
  const statusMeta = STATUS_LABEL[status as KnownStatus] ?? STATUS_LABEL.LOCKED;
  const date = dateLine(status, expiresAt, redeemedAt);

  return (
    <TicketCard className="flex flex-wrap items-center gap-3 px-4 pb-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-citrus-50 text-citrus-500">
        <IconGift className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-ink-900">{name}</p>
        {description && (
          <p className="truncate text-xs text-ink-500">{description}</p>
        )}
        <p className="font-mono text-xs text-ink-500">
          Requiere {requiredStickers} stickers
        </p>
        {date && <p className="mt-0.5 text-[11px] text-ink-500/80">{date}</p>}
      </div>
      {action ?? <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>}
    </TicketCard>
  );
}
