import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { ConnectivityBanner } from "@/components/connectivity-banner";
import "./globals.css";

// UI PACK — LOOP 01: Sora como única familia (cuerpo y display), tal como
// la nombra el mockup del pack visual — reemplaza al par Inter (cuerpo) +
// Fraunces (títulos/cifras, elegida antes como guiño a etiquetas de cajas
// de fruta vintage). Se mapea a las dos custom properties existentes
// (--font-sans y --font-display) para no tener que tocar cada uso de
// `font-sans`/`font-display` en el resto del código.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Monoespaciada para códigos de boleta, tokens y fechas — refuerza la
// sensación de "recibo/talonario". El pack UI no nombra una mono propia y
// el look de "ticket" ya depende de esta en varios lados, así que se
// mantiene.
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JugoClub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#158448",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sora.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ConnectivityBanner />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
