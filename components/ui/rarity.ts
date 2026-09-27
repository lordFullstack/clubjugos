/**
 * Fuente única de verdad para todo lo visual relacionado con la rareza de un
 * sticker (`public.sticker_rarity` en la base de datos). Antes de este
 * archivo, `sticker-grid.tsx` y `reward-reveal.tsx` mantenían cada uno su
 * propio mapa de colores/labels para las mismas 5 rarezas, con riesgo de que
 * divergieran visualmente entre el álbum y la revelación.
 *
 * SPECIAL (stickers.kind = 'SPECIAL') es un concepto aparte de la rareza y
 * no vive acá: un sticker especial igual tiene una rareza propia, pero su
 * tratamiento visual (foil + halo) se decide por su `kind`, no por este mapa.
 */
export type StickerRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY";

export type RarityMeta = {
  /** Label corto para mostrar en el álbum / badges. */
  label: string;
  /** Label largo para el momento de revelación ("STICKER COMÚN"). */
  revealLabel: string;
  /** Color de texto (sobre fondo oscuro, ej. modal de revelación). */
  textOnDark: string;
  /** Color de texto (sobre fondo claro, ej. badge en el álbum). */
  textOnLight: string;
  /** Ring/borde para la miniatura en el álbum. */
  ring: string;
  /** Fondo sutil para un badge de rareza. */
  badgeBg: string;
  /** Glow opcional para rarezas altas (EPIC/LEGENDARY). Vacío si no aplica. */
  glow: string;
};

export const RARITY_ORDER: StickerRarity[] = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
];

export const RARITY: Record<StickerRarity, RarityMeta> = {
  COMMON: {
    label: "Común",
    revealLabel: "STICKER COMÚN",
    textOnDark: "text-paper-200",
    textOnLight: "text-ink-500",
    ring: "ring-ink-900/10",
    badgeBg: "bg-ink-900/5",
    glow: "",
  },
  UNCOMMON: {
    label: "Poco común",
    revealLabel: "STICKER POCO COMÚN",
    textOnDark: "text-jade-300",
    textOnLight: "text-jade-600",
    ring: "ring-jade-500/40",
    badgeBg: "bg-jade-50",
    glow: "",
  },
  RARE: {
    label: "Raro",
    revealLabel: "STICKER RARO",
    textOnDark: "text-sky-300",
    textOnLight: "text-sky-600",
    ring: "ring-sky-500/40",
    badgeBg: "bg-sky-50",
    glow: "",
  },
  EPIC: {
    label: "Épico",
    revealLabel: "STICKER ÉPICO",
    textOnDark: "text-guava-light",
    textOnLight: "text-guava-dark",
    ring: "ring-guava/50",
    badgeBg: "bg-guava-light/15",
    glow: "shadow-[0_0_0_3px_rgba(226,62,119,0.18)]",
  },
  LEGENDARY: {
    label: "Legendario",
    revealLabel: "STICKER LEGENDARIO",
    textOnDark: "text-foil-light",
    textOnLight: "text-foil-dark",
    ring: "ring-foil/70",
    badgeBg: "bg-foil-light/20",
    glow: "shadow-[0_0_0_3px_rgba(200,155,60,0.25)]",
  },
};

/** Devuelve la metadata de una rareza, con COMMON como respaldo seguro si
 * llega un valor inesperado desde la base de datos. */
export function getRarityMeta(rarity: string): RarityMeta {
  return RARITY[rarity as StickerRarity] ?? RARITY.COMMON;
}
