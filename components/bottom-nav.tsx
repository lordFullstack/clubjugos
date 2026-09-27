"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconAlbum,
  IconScan,
  IconPrize,
  IconProfile,
} from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";

const TABS = [
  { href: "/home", label: "Inicio", Icon: IconHome, isCta: false },
  { href: "/collection", label: "Álbum", Icon: IconAlbum, isCta: false },
  { href: "/scan", label: "Escanear", Icon: IconScan, isCta: true },
  { href: "/prizes", label: "Premios", Icon: IconPrize, isCta: false },
  { href: "/profile", label: "Perfil", Icon: IconProfile, isCta: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto flex max-w-sm items-end justify-between rounded-[28px] border border-ink-900/5 bg-white/90 px-3 pb-2 pt-2 shadow-ticket backdrop-blur-md">
        {TABS.map(({ href, label, Icon, isCta }) => {
          if (isCta) {
            return (
              <li key={href} className="-mt-7">
                <IconButton
                  href={href}
                  size="lg"
                  aria-label="Escanear QR"
                  className="border-4 border-paper-100 bg-gradient-to-b from-citrus-400 to-citrus-600 text-white shadow-soft"
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </IconButton>
              </li>
            );
          }

          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[11px] font-bold transition active:scale-90 active:bg-ink-900/5 ${
                  active ? "text-citrus-600" : "text-ink-500"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition ${active ? "-translate-y-0.5" : ""}`}
                  strokeWidth={active ? 2.1 : 1.8}
                />
                {label}
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
