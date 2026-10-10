import Image from "next/image";

const SIZE_CLASS = {
  sm: "w-24",
  md: "w-40",
  lg: "w-56",
} as const;

/**
 * Logo del negocio donde funciona el club (pa'COMER). Es un PNG con fondo
 * transparente y un borde blanco tipo sticker, así que se ve bien tanto
 * sobre fondos claros como sobre el verde de Home. El archivo vive en
 * `public/brand/` (no en Storage) porque es un asset fijo de la marca.
 */
export function BusinessLogo({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/pa-comer-logo.png"
      alt="pa'COMER — Pa' conservar la tradición"
      width={722}
      height={258}
      priority={priority}
      className={`h-auto ${SIZE_CLASS[size]} ${className}`}
    />
  );
}
