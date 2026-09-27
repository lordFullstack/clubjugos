import { getRarityMeta } from "@/components/ui/rarity";

/**
 * Badge de rareza reutilizable. `tone="dark"` es para usar sobre fondos
 * oscuros (modal de revelación, tarjetas jade); `tone="light"` (default)
 * para usarlo sobre fondos claros (álbum, listas).
 */
export function RarityBadge({
  rarity,
  tone = "light",
  size = "sm",
  className = "",
}: {
  rarity: string;
  tone?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = getRarityMeta(rarity);

  if (tone === "dark") {
    // Píldora sólida, como "STICKER COMÚN" en el mockup del modal de
    // revelación — antes era texto suelto sin fondo.
    return (
      <span
        className={`inline-flex items-center rounded-full font-bold uppercase tracking-wide ${meta.badgeBgOnDark} ${meta.textOnDark} ${
          size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
        } ${className}`}
      >
        {size === "sm" ? meta.label : meta.revealLabel}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${meta.badgeBg} ${meta.textOnLight} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      {meta.label}
    </span>
  );
}
