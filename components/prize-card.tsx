import type { ReactNode } from "react";
import { TicketCard } from "@/components/ticket-card";
import { IconGift } from "@/components/icons";

type KnownStatus = "AVAILABLE" | "REDEEMED" | "EXPIRED" | "LOCKED";

const STATUS_LABEL: Record<KnownStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Disponible", className: "bg-citrus-100 text-citrus-700" },
  REDEEMED: { label: "Canjeado", className: "bg-ink-900/5 text-ink-500" },
  EXPIRED: { label: "Expirado", className: "bg-red-50 text-red-500" },
  LOCKED: { label: "Bloqueado", className: "bg-ink-900/5 text-ink-500" },
};

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
  action,
}: {
  name: string;
  description?: string | null;
  requiredStickers: number;
  status: string;
  action?: ReactNode;
}) {
  const statusMeta = STATUS_LABEL[status as KnownStatus] ?? STATUS_LABEL.LOCKED;

  return (
    <TicketCard className="flex flex-wrap items-center gap-3 px-4 pb-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-citrus-50 text-citrus-500">
        <IconGift className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-ink-900">{name}</p>
        {description ? (
          <p className="truncate text-xs text-ink-500">{description}</p>
        ) : (
          <p className="font-mono text-xs text-ink-500">
            Requiere {requiredStickers} stickers
          </p>
        )}
      </div>
      {action ?? (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      )}
    </TicketCard>
  );
}
