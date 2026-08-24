"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/services/auth-service";

const ALL_LINKS = [
  { href: "/admin", label: "Dashboard", roles: ["ADMIN", "OPERATOR"] },
  { href: "/admin/campaign", label: "Campaña", roles: ["ADMIN"] },
  { href: "/admin/stickers", label: "Stickers", roles: ["ADMIN"] },
  { href: "/admin/prizes", label: "Premios", roles: ["ADMIN"] },
  { href: "/admin/qr", label: "Generar QR", roles: ["ADMIN", "OPERATOR"] },
  { href: "/admin/customers", label: "Clientes", roles: ["ADMIN", "OPERATOR"] },
  { href: "/admin/redemptions", label: "Canjes", roles: ["ADMIN", "OPERATOR"] },
];

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
  const links = ALL_LINKS.filter((link) => link.roles.includes(role));

  return (
    <div className="min-h-screen bg-black/[0.02]">
      <header className="border-b border-black/5 bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="font-display text-lg font-extrabold text-ink-900">
              🥤 JugoClub <span className="text-brand-500">Admin</span>
            </p>
            <p className="text-xs text-ink-500">
              {name} · {role === "ADMIN" ? "Administrador" : "Operador"}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink-700"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        <nav className="mx-auto mt-3 flex max-w-6xl gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-500 text-white"
                    : "text-ink-500 hover:bg-black/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">{children}</main>
    </div>
  );
}
