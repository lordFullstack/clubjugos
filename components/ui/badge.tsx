/**
 * UI PACK — LOOP 01: `Badge` genérico de estado/etiqueta. Antes cada lugar
 * que necesitaba una píldora de color (estado de premio en `PrizeCard`,
 * Activo/Inactivo en el admin, rareza de sticker en `sticker-list.tsx`)
 * repetía las mismas clases de pastilla a mano. `RarityBadge`
 * (components/ui/rarity-badge.tsx) sigue siendo el componente específico
 * para rareza de sticker — este es el genérico para todo lo demás.
 */
export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-ink-900/5 text-ink-500",
  success: "bg-citrus-100 text-citrus-700",
  warning: "bg-foil-light/30 text-foil-dark",
  danger: "bg-red-50 text-red-500",
  info: "bg-jade-100 text-jade-700",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
