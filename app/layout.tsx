import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Serif de carácter, con guiño a la tipografía de etiquetas de cajas de
// fruta vintage — es la voz visual de la marca (logo, títulos, cifras).
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

// Monoespaciada para códigos de boleta, tokens y fechas — refuerza la
// sensación de "recibo/talonario".
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JugoClub — Compra. Colecciona. Gana.",
  description:
    "Colecciona stickers digitales cada vez que compras y desbloquea premios en tu juguería favorita.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e5511a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
