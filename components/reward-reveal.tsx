"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconGift } from "@/components/icons";

type Props = {
  name: string;
  emoji: string;
  rarity: string;
  isDuplicate: boolean;
  obtainedCount: number;
  completionTarget: number;
  prizeUnlocked: boolean;
};

const RARITY_LABEL: Record<string, string> = {
  COMMON: "STICKER COMÚN",
  UNCOMMON: "STICKER POCO COMÚN",
  RARE: "STICKER RARO",
  EPIC: "STICKER ÉPICO",
  LEGENDARY: "STICKER LEGENDARIO",
};

const RARITY_COLOR: Record<string, string> = {
  COMMON: "text-paper-200",
  UNCOMMON: "text-jade-300",
  RARE: "text-sky-300",
  EPIC: "text-guava-light",
  LEGENDARY: "text-foil-light",
};

export function RewardReveal({
  name,
  emoji,
  rarity,
  isDuplicate,
  obtainedCount,
  completionTarget,
  prizeUnlocked,
}: Props) {
  const [count, setCount] = useState(3);
  const isRare = rarity === "RARE" || rarity === "EPIC" || rarity === "LEGENDARY";

  useEffect(() => {
    if (count === 0) return;
    const timer = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (count === 0 && "vibrate" in navigator) {
      navigator.vibrate(isRare ? [40, 60, 90] : 40);
    }
  }, [count, isRare]);

  if (count > 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-jade-900 text-white">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
          Abriendo tu boleta...
        </p>
        <p
          key={count}
          className="mt-4 animate-pop-in font-display text-8xl font-black text-foil-light"
        >
          {count}
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-jade-900 px-6 text-center text-white">
      {isRare && <ConfettiBurst />}

      <p className="animate-tear-in font-display text-2xl font-extrabold">
        ¡LO CONSEGUISTE!
      </p>

      <div
        className={`foil-shine play relative flex h-32 w-32 animate-pop-in items-center justify-center overflow-hidden rounded-4xl bg-white text-7xl shadow-soft ${
          rarity === "LEGENDARY" ? "ring-4 ring-foil" : ""
        }`}
      >
        {emoji}
      </div>

      <div>
        <p
          className={`text-xs font-bold uppercase tracking-[0.2em] ${
            RARITY_COLOR[rarity] ?? RARITY_COLOR.COMMON
          }`}
        >
          {RARITY_LABEL[rarity] ?? "STICKER"}
        </p>
        <p className="mt-1 font-display text-xl font-extrabold">{name}</p>
      </div>

      {isDuplicate && (
        <p className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/70">
          Sticker repetido
        </p>
      )}

      <p className="text-white/70">
        Ya tienes {obtainedCount} de {completionTarget}
      </p>

      {prizeUnlocked && (
        <p className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foil-light bg-white/10 px-4 py-3 text-sm font-bold text-foil-light">
          <IconGift className="h-5 w-5 shrink-0" strokeWidth={1.8} />
          ¡Desbloqueaste tu premio! Revísalo en la sección Premios.
        </p>
      )}

      <Link
        href="/collection"
        className="mt-4 w-full max-w-sm rounded-2xl bg-gradient-to-b from-citrus-400 to-citrus-600 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98]"
      >
        VER ÁLBUM
      </Link>
    </main>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="absolute top-1/4 h-2 w-2 animate-pop-in rounded-sm"
          style={{
            left: `${(i / pieces.length) * 100}%`,
            backgroundColor: ["#e5511a", "#146356", "#c89b3c", "#e23e77"][
              i % 4
            ],
            animationDelay: `${i * 30}ms`,
          }}
        />
      ))}
    </div>
  );
}
