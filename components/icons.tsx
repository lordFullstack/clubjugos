import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Inicio — un puesto/kiosco de jugos, no una casa genérica. */
export function IconHome(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
      <path d="M9 20v-5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V20" />
      <path d="M9.5 9.5h5" />
    </svg>
  );
}

/** Álbum — un cromo despegándose de una tarjeta, remite a coleccionar. */
export function IconAlbum(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="12" height="12" rx="2.5" />
      <path d="M8 5.5v12" strokeDasharray="2 2.4" />
      <path d="M15.5 8 20 6.7a1 1 0 0 1 1.3 1.2l-3 11.1a1 1 0 0 1-1.24.7l-2.06-.6" />
    </svg>
  );
}

/** Escanear — esquinas de visor QR, no una cámara literal. */
export function IconScan(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8" />
      <path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" />
      <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16" />
      <path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.2" />
    </svg>
  );
}

/** Premios — cinta de medalla, no un regalo genérico. */
export function IconPrize(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="M9.3 13.2 7.5 20l4.5-2.2 4.5 2.2-1.8-6.8" />
    </svg>
  );
}

/** Perfil — retrato simple, trazo consistente con el resto del set. */
export function IconProfile(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.3" r="3.3" />
      <path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
    </svg>
  );
}

/** Vaso de jugo con pajilla — usado en encabezados y estados vacíos. */
export function IconJuiceCup(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3.5h6M10 3.5l.8 16a1.2 1.2 0 0 0 1.2 1.1 1.2 1.2 0 0 0 1.2-1.1l.8-16" />
      <path d="M7.3 8h9.4l-.9 4.3a4.7 4.7 0 0 1-9.6 0Z" />
      <path d="M15 1.5 13.7 4.3" />
    </svg>
  );
}

/** Regalo — usado como icono grande en estados vacíos y listas de premios. */
export function IconGift(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="9.5" width="16" height="11" rx="1.4" />
      <path d="M4 13.5h16" />
      <path d="M12 9.5V21" />
      <path d="M12 9.5C10.5 6 7 5.7 7 8s2.6 1.5 5 1.5" />
      <path d="M12 9.5c1.5-3.5 5-3.8 5-1.5s-2.6 1.5-5 1.5" />
    </svg>
  );
}

/** Persona — avatar por defecto del perfil, en vez de un emoji de carita. */
export function IconAvatar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="3.6" />
      <path d="M5.5 20c0-3.8 3-6.5 6.5-6.5s6.5 2.7 6.5 6.5" />
    </svg>
  );
}
