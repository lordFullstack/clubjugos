import type { ReactNode } from "react";

/**
 * Estado vacío reutilizable. Antes cada pantalla (Home, Álbum, Premios,
 * QrScanner) armaba su propio bloque "sin campaña / sin premios / sin
 * cámara" a mano, con markup parecido pero no compartido.
 *
 * `icon` acepta tanto un ícono SVG del design system (`<IconGift .../>`)
 * como un emoji simple (string), para no perder los estados ya escritos
 * en `qr-scanner.tsx`.
 *
 * `bare` omite el "chrome" de tarjeta (fondo blanco + sombra): se usa cuando
 * el EmptyState ya va anidado dentro de una `<TicketCard>` (Home, Álbum,
 * Premios), para no perder el borde perforado que es la firma visual de la
 * app. Sin `bare`, se ve como una tarjeta standalone (ej. `qr-scanner.tsx`,
 * que no vive dentro de una boleta).
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
  bare = false,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  bare?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`text-center ${bare ? "" : "rounded-3xl bg-white p-6 shadow-card"} ${className}`}
    >
      {icon && (
        <div className="mx-auto flex h-10 items-center justify-center text-4xl text-citrus-400">
          {icon}
        </div>
      )}
      <p className="mt-2 font-semibold text-ink-900">{title}</p>
      {message && <p className="mt-1 text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
