import type { Config } from "tailwindcss";

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
          50: "#fffdf8",
          100: "#fbf3e3",
          200: "#f3e4c6",
          300: "#e8d2a4",
        },
        // Tinta principal — negro cálido, no #000 puro
        ink: {
          900: "#241c15",
          700: "#4a3b2c",
          500: "#8a7a64",
        },
        // Cítrico quemado — color de marca, más rico que el naranja de stock
        citrus: {
          50: "#fff1e8",
          100: "#ffdfc7",
          200: "#ffc194",
          300: "#ff9f5d",
          400: "#f86f32",
          500: "#e5511a",
          600: "#c43f10",
          700: "#9c310c",
          800: "#742409",
          900: "#4d1806",
        },
        // Verde jade — hoja de fruta, contraste secundario / momentos especiales
        jade: {
          50: "#eaf6f1",
          100: "#cbeae0",
          300: "#6fbfa6",
          500: "#146356",
          600: "#0f4f45",
          700: "#0b3b34",
          900: "#062621",
        },
        // Dorado foil — acentos de rareza/premio (usar con moderación)
        foil: {
          light: "#e7c878",
          DEFAULT: "#c89b3c",
          dark: "#8a6a22",
        },
        // Guayaba — pop de rareza épica/legendaria
        guava: {
          light: "#f786ac",
          DEFAULT: "#e23e77",
          dark: "#a92857",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(36, 28, 21, 0.28)",
        card: "0 4px 16px -6px rgba(36, 28, 21, 0.14)",
        ticket: "0 14px 34px -12px rgba(36, 28, 21, 0.22)",
        stamp: "inset 0 0 0 2px rgba(36, 28, 21, 0.08)",
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
        "stamp-in": {
          "0%": { transform: "scale(2) rotate(-18deg)", opacity: "0" },
          "60%": { transform: "scale(0.92) rotate(-8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
        "tear-in": {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.25s ease-out",
        float: "float 3s ease-in-out infinite",
        shine: "shine 1.4s ease-in-out",
        "stamp-in": "stamp-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        "tear-in": "tear-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
