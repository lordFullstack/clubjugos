import type { ReactNode } from "react";

/**
 * Tarjeta con borde superior perforado, como una boleta arrancada de un
 * talonario. Es el elemento visual firma de JugoClub: toda pantalla de
 * colección, premios o progreso vive dentro de una "boleta".
 */
export function TicketCard({
  children,
  className = "",
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "jade";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-4xl pt-4 shadow-ticket ${
        tone === "jade" ? "bg-jade-700 text-white" : "bg-white"
      } ${className}`}
    >
      <div
        className={tone === "jade" ? "ticket-notch-top-jade" : "ticket-notch-top"}
        aria-hidden
      />
      {children}
    </div>
  );
}

/**
 * Línea de corte punteada para separar secciones dentro de una TicketCard.
 * Sin children, es solo la línea; con children, envuelve el contenido que
 * va debajo del corte.
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

/** Insignia circular tipo sello de tinta, para % de progreso o estado. */
export function StampBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-14 w-14 shrink-0 -rotate-[8deg] animate-stamp-in items-center justify-center rounded-full border-2 border-dashed border-citrus-500 font-display text-sm font-bold text-citrus-600 ${className}`}
    >
      {children}
    </div>
  );
}
