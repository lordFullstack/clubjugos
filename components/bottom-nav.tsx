"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Inicio", icon: "🏠", isCta: false },
  { href: "/collection", label: "Álbum", icon: "🎴", isCta: false },
  { href: "/scan", label: "Escanear", icon: "📷", isCta: true },
  { href: "/prizes", label: "Premios", icon: "🎁", isCta: false },
  { href: "/profile", label: "Perfil", icon: "👤", isCta: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto flex max-w-sm items-end justify-between rounded-[28px] border border-ink-900/5 bg-white/90 px-3 pb-2 pt-2 shadow-ticket backdrop-blur-md">
        {TABS.map((tab) => {
          if (tab.isCta) {
            return (
              <li key={tab.href} className="-mt-7">
                <Link
                  href={tab.href}
                  aria-label="Escanear QR"
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-paper-100 bg-gradient-to-b from-citrus-400 to-citrus-600 text-2xl text-white shadow-soft transition active:scale-95"
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
                className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] font-bold transition ${
                  active ? "text-citrus-600" : "text-ink-500"
                }`}
              >
                <span className={`text-lg transition ${active ? "-translate-y-0.5" : ""}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {active && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-citrus-500" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
