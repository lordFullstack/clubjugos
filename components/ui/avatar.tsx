import Image from "next/image";
import { IconAvatar } from "@/components/icons";

/**
 * UI PACK — LOOP 01: `Avatar` — antes el círculo blanco con `IconAvatar`
 * de `app/profile/page.tsx` era un `<div>` armado a mano, sin componente
 * propio pese a ser un patrón con nombre en el pack. Acepta una imagen
 * real (`avatar_url`, que `profiles` ya tiene en el modelo aunque nadie lo
 * suba todavía) y cae al ícono genérico si no hay ninguna — no se inventa
 * upload de foto de perfil, eso no lo pide este loop.
 */
export function Avatar({
  src,
  name,
  size = "lg",
  className = "",
}: {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: 40, md: 56, lg: 80 }[size];
  const iconClass = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-9 w-9" }[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-citrus-500 shadow-card ${className}`}
      style={{ width: dims, height: dims }}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? ""}
          width={dims}
          height={dims}
          className="h-full w-full object-cover"
        />
      ) : (
        <IconAvatar className={iconClass} strokeWidth={1.6} />
      )}
    </div>
  );
}
