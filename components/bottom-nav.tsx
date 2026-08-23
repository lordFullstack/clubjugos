"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Inicio", icon: "🏠", isCta: false },
  { href: "/collection", label: "Colección", icon: "🎴", isCta: false },
  { href: "/scan", label: "Escanear", icon: "📷", isCta: true },
  { href: "/prizes", label: "Premios", icon: "🎁", isCta: false },
  { href: "/profile", label: "Perfil", icon: "👤", isCta: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <ul className="mx-auto flex max-w-sm items-end justify-between">
        {TABS.map((tab) => {
          if (tab.isCta) {
            return (
              <li key={tab.href} className="-mt-6">
                <Link
                  href={tab.href}
                  aria-label="Escanear QR"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-white shadow-soft transition active:scale-95"
                >
                  {tab.icon}
                </Link>
              </li>
            );
          }

          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "text-brand-600" : "text-ink-500"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
