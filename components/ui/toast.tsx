"use client";

/**
 * Toast/feedback visual único del design system. Es deliberadamente "tonto":
 * no trae su propio contexto/cola global todavía (eso implicaría decidir
 * timing y prioridad entre pantallas, que no es un tema de LOOP 01). Cada
 * pantalla sigue controlando su propio estado local (como ya hace
 * `RedeemPrizeButton`) y renderiza `<Toast>` en vez de un `<p>` de error a
 * mano, para que todos los mensajes de feedback se vean igual.
 */
export function Toast({
  kind = "error",
  children,
  className = "",
}: {
  kind?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const KIND_CLASS: Record<typeof kind, string> = {
    error: "bg-red-50 text-red-600",
    success: "bg-jade-50 text-jade-600",
    info: "bg-citrus-50 text-citrus-700",
  };

  return (
    <p
      role="status"
      className={`rounded-2xl px-4 py-3 text-sm font-medium ${KIND_CLASS[kind]} ${className}`}
    >
      {children}
    </p>
  );
}
