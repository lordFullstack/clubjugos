import type { ReactNode } from "react";

/**
 * Card base del design system: blanca, esquinas redondeadas, sombra suave
 * — así es como el mockup (JugoClub-UI-Loops-Pack) resuelve toda pantalla
 * de colección/premios/progreso. El nombre `TicketCard` es un remanente de
 * la v1 de LOOP 01 (una idea de "boleta perforada" que no está en el
 * mockup real y se sacó); se mantiene el nombre para no forzar un rename
 * en los ~10 archivos que ya la importan.
 *
 * `tone="jade"` es el fondo oscuro del modal de revelación cuando el
 * resultado es un sticker normal; `tone="special"` es el violeta que usa
 * ese mismo modal cuando el resultado es un ESPECIAL (el único lugar del
 * mockup donde aparece violeta).
 */
export function TicketCard({
  children,
  className = "",
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "jade" | "special";
}) {
  const TONE_CLASS: Record<"paper" | "jade" | "special", string> = {
    paper: "bg-white",
    jade: "bg-gradient-to-b from-jade-700 to-ink-900 text-white",
    special: "bg-gradient-to-b from-special-500 to-special-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl pt-5 shadow-card ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Divisor simple para separar secciones dentro de una TicketCard. Sin
 * children, es solo la línea; con children, envuelve el contenido que va
 * debajo.
 */
export function TicketDivider({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ticket-divider ${className}`}>{children}</div>
  );
}

/** Píldora para % de progreso o estado — pill sólida, como en el mockup
 * (nada de sello rotado ni borde punteado, eso era invención de la v1). */
export function StampBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-10 shrink-0 animate-pop-in items-center justify-center rounded-full bg-citrus-50 px-3.5 font-display text-sm font-bold text-citrus-700 ${className}`}
    >
      {children}
    </div>
  );
}
