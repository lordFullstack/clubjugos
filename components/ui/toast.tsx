"use client";

/**
 * Toast/feedback visual único del design system. Es deliberadamente "tonto":
 * no trae su propio contexto/cola global todavía (eso implicaría decidir
 * timing y prioridad entre pantallas, que no es un tema de LOOP 01). Cada
 * pantalla sigue controlando su propio estado local (como ya hace
 * `RedeemPrizeButton`) y renderiza `<Toast>` en vez de un `<p>` de error a
 * mano, para que todos los mensajes de feedback se vean igual.
 *
 * `tone="dark"` (LOOP 06) es para usarlo sobre fondos oscuros — ej. el
 * error de QR en `/scan`, que vive sobre `bg-citrus-900` — sin que el fondo
 * clarito de la variante por defecto quede ilegible ahí.
 */
export function Toast({
  kind = "error",
  tone = "light",
  children,
  className = "",
}: {
  kind?: "error" | "success" | "info";
  tone?: "light" | "dark";
  children: React.ReactNode;
  className?: string;
}) {
  const KIND_CLASS: Record<"light" | "dark", Record<typeof kind, string>> = {
    light: {
      error: "bg-red-50 text-red-600",
      success: "bg-jade-50 text-jade-600",
      info: "bg-citrus-50 text-citrus-700",
    },
    dark: {
      error: "bg-red-500/15 text-red-200",
      success: "bg-jade-500/20 text-jade-100",
      info: "bg-white/10 text-white",
    },
  };

  return (
    <p
      role="status"
      className={`rounded-2xl px-4 py-3 text-sm font-medium ${KIND_CLASS[tone][kind]} ${className}`}
    >
      {children}
    </p>
  );
}
