import type { Config } from "tailwindcss";

// UI PACK — LOOP 01: cada color referencia la custom property equivalente
// definida en app/globals.css (`rgb(var(--color-x) / <alpha-value>)` es el
// formato que espera Tailwind para poder seguir generando modificadores de
// opacidad — `bg-citrus-500/40`, `ring-ink-900/10`, etc. — sobre un color
// que en el fondo es una CSS var). Los valores hex ya NO viven acá: la
// fuente de verdad es globals.css, esto solo la conecta a las clases de
// utilidad de Tailwind.
function cssVarColor(name: string): string {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondo "papel de álbum" — cálido, no el crema genérico de IA
        paper: {
          50: cssVarColor("paper-50"),
          100: cssVarColor("paper-100"),
          200: cssVarColor("paper-200"),
          300: cssVarColor("paper-300"),
        },
        // Tinta principal — negro cálido, no #000 puro
        ink: {
          900: cssVarColor("ink-900"),
          700: cssVarColor("ink-700"),
          500: cssVarColor("ink-500"),
        },
        // Cítrico quemado — color de marca, más rico que el naranja de stock
        citrus: {
          50: cssVarColor("citrus-50"),
          100: cssVarColor("citrus-100"),
          200: cssVarColor("citrus-200"),
          300: cssVarColor("citrus-300"),
          400: cssVarColor("citrus-400"),
          500: cssVarColor("citrus-500"),
          600: cssVarColor("citrus-600"),
          700: cssVarColor("citrus-700"),
          800: cssVarColor("citrus-800"),
          900: cssVarColor("citrus-900"),
        },
        // Verde jade — contraste secundario (éxito/online/rareza "poco común")
        jade: {
          50: cssVarColor("jade-50"),
          100: cssVarColor("jade-100"),
          300: cssVarColor("jade-300"),
          500: cssVarColor("jade-500"),
          600: cssVarColor("jade-600"),
          700: cssVarColor("jade-700"),
          900: cssVarColor("jade-900"),
        },
        // Violeta — único momento del mockup que lo usa: el modal de
        // "¡TE SALIÓ UN ESPECIAL!" (sticker-reveal-modal.tsx).
        special: {
          100: cssVarColor("special-100"),
          500: cssVarColor("special-500"),
          700: cssVarColor("special-700"),
          900: cssVarColor("special-900"),
        },
        // Dorado foil — acentos de rareza/premio (usar con moderación)
        foil: {
          light: cssVarColor("foil-light"),
          DEFAULT: cssVarColor("foil"),
          dark: cssVarColor("foil-dark"),
        },
        // Guayaba — pop de rareza épica/legendaria
        guava: {
          light: cssVarColor("guava-light"),
          DEFAULT: cssVarColor("guava"),
          dark: cssVarColor("guava-dark"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "var(--radius-lg)",
        "3xl": "var(--radius-xl)",
        "4xl": "var(--radius-2xl)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        ticket: "var(--shadow-ticket)",
        stamp: "inset 0 0 0 2px rgba(36, 28, 21, 0.08)",
      },
      spacing: {
        "2xs": "var(--space-2xs)",
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) rotate(8deg)" },
          "100%": { transform: "translateX(220%) rotate(8deg)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-24px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(480px) rotate(600deg)", opacity: "0" },
        },
        "stamp-in": {
          "0%": { transform: "scale(2) rotate(-18deg)", opacity: "0" },
          "60%": { transform: "scale(0.92) rotate(-8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
        "tear-in": {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "reveal-pop": {
          "0%": { transform: "scale(0.82) rotate(-6deg)", opacity: "0" },
          "60%": { transform: "scale(1.04) rotate(1deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        // UI LOOP 03: línea de escaneo que sube y baja dentro del recuadro de
        // la cámara — refuerza "está buscando el QR" sin agregar texto extra.
        "scan-line": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.25s ease-out",
        float: "float 3s ease-in-out infinite",
        shine: "shine 1.4s ease-in-out",
        "confetti-fall": "confetti-fall 1.6s ease-in forwards",
        "stamp-in": "stamp-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        "tear-in": "tear-in 0.4s ease-out",
        // LOOP 03: entrada del sticker en el modal de revelacion — arranca
        // ~200ms despues de que aparece la card (fase 250-600ms del spec).
        "reveal-pop": "reveal-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
        "scan-line": "scan-line 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
