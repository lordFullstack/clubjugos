import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // naranja jugo — color primario
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        tropical: {
          lime: "#a3e635",
          mango: "#fbbf24",
          strawberry: "#fb7185",
          kiwi: "#65a30d",
          grape: "#c084fc",
        },
        ink: {
          900: "#1c1917",
          700: "#44403c",
          500: "#78716c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(28, 25, 23, 0.15)",
        card: "0 4px 14px -4px rgba(28, 25, 23, 0.12)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.25s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
