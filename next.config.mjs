/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    // El límite por defecto de Server Actions es 1 MB. El formulario de
    // stickers sube imágenes de hasta 5 MB directo por Server Action
    // (services/sticker-admin-actions.ts), así que hay que subir el
    // límite o Next.js rechaza la petición ANTES de llegar a nuestro
    // código con "Body exceeded 1 MB limit."
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
