"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/services/auth-service";
import { BusinessLogo } from "@/components/business-logo";
import {
  IconAlbum,
  IconGift,
  IconHome,
  IconJuiceCup,
  IconPrize,
  IconProfile,
  IconScan,
} from "@/components/icons";

type IconComponent = (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;

const ALL_LINKS: {
  href: string;
  label: string;
  roles: string[];
  Icon: IconComponent;
}[] = [
  { href: "/admin", label: "Dashboard", roles: ["ADMIN", "OPERATOR"], Icon: IconHome },
  { href: "/admin/campaign", label: "Campaña", roles: ["ADMIN"], Icon: IconJuiceCup },
  { href: "/admin/stickers", label: "Stickers", roles: ["ADMIN"], Icon: IconAlbum },
  { href: "/admin/prizes", label: "Premios", roles: ["ADMIN"], Icon: IconPrize },
  { href: "/admin/qr", label: "Generar QR", roles: ["ADMIN", "OPERATOR"], Icon: IconScan },
  { href: "/admin/customers", label: "Clientes", roles: ["ADMIN", "OPERATOR"], Icon: IconProfile },
  { href: "/admin/redemptions", label: "Canjes", roles: ["ADMIN", "OPERATOR"], Icon: IconGift },
];

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 8l4 4-4 4M20 12H9" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

/**
 * Pack UI LOOP 07 — shell responsive del admin (solo UI; rutas, roles y la
 * server action `logout` son las de siempre):
 *  - Desktop (lg+): sidebar fija con etiquetas + contenido.
 *  - Tablet (md–lg): sidebar colapsada a un riel de íconos; el botón de
 *    arriba la expande/colapsa.
 *  - Móvil (<md): top bar + navegación compacta con scroll horizontal.
 */
export function AdminShell({
  role,
  name,
  children,
}: {
  role: string;
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Solo importa en tablet: en lg+ la sidebar siempre va expandida.
  const [expanded, setExpanded] = useState(false);
  const links = ALL_LINKS.filter((link) => link.roles.includes(role));
  const roleLabel = role === "ADMIN" ? "Administrador" : "Operador";

  // Etiquetas visibles: siempre en lg+; en tablet solo si está expandida.
  const labelClass = expanded ? "" : "hidden lg:inline";

  return (
    <div className="min-h-screen bg-paper-100 md:flex">
      {/* ===== Móvil: top bar + navegación compacta ===== */}
      <header className="sticky top-0 z-20 bg-citrus-900 text-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-extrabold leading-tight">
              Jugo<span className="text-citrus-300">Club</span>{" "}
              <span className="text-white/70">Admin</span>
            </p>
            <p className="truncate text-xs text-white/60">
              {name} · {roleLabel}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </form>
        </div>

        <nav
          aria-label="Secciones del admin"
          className="flex gap-1 overflow-x-auto px-3 pb-3"
        >
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-citrus-800"
                    : "bg-white/10 text-white/80 active:bg-white/20"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.1 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ===== Tablet / desktop: sidebar ===== */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-citrus-900 text-white transition-[width] duration-200 md:flex ${
          expanded ? "w-64" : "w-[4.5rem] lg:w-64"
        }`}
      >
        <div className="flex items-center gap-2 px-3 pt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Contraer menú" : "Expandir menú"}
            aria-expanded={expanded}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className={`min-w-0 ${labelClass}`}>
            <BusinessLogo size="sm" />
          </div>
        </div>

        <div className={`px-5 pt-3 ${labelClass}`}>
          <p className="font-display text-lg font-extrabold leading-tight">
            Jugo<span className="text-citrus-300">Club</span>{" "}
            <span className="text-white/70">Admin</span>
          </p>
        </div>

        <nav
          aria-label="Secciones del admin"
          className="mt-5 flex-1 space-y-1 overflow-y-auto px-3"
        >
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${active ? "text-citrus-300" : ""}`}
                  strokeWidth={active ? 2.1 : 1.8}
                />
                <span className={labelClass}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className={`px-2 pb-2 ${labelClass}`}>
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-white/60">{roleLabel}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogoutIcon className="h-5 w-5 shrink-0" />
              <span className={labelClass}>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
