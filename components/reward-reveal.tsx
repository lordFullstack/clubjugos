"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-900 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
          Abriendo tu recompensa...
        </p>
        <p key={count} className="mt-4 animate-pop-in text-7xl font-black">
          {count}
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-6 text-center">
      {isRare && <ConfettiBurst />}

      <p className="animate-pop-in text-2xl font-extrabold text-ink-900">
        🎉 ¡LO CONSEGUISTE!
      </p>

      <div className="flex h-32 w-32 animate-pop-in items-center justify-center rounded-3xl bg-white text-7xl shadow-soft">
        {emoji}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-500">
          {RARITY_LABEL[rarity] ?? "STICKER"}
        </p>
        <p className="font-display text-lg font-extrabold text-ink-900">
          {name}
        </p>
      </div>

      {isDuplicate && (
        <p className="rounded-full bg-ink-900/5 px-4 py-1.5 text-sm font-medium text-ink-500">
          Sticker repetido
        </p>
      )}

      <p className="text-ink-500">
        Ya tienes {obtainedCount} de {completionTarget}
      </p>

      {prizeUnlocked && (
        <p className="rounded-2xl bg-brand-100 px-4 py-3 text-sm font-bold text-brand-700">
          🎁 ¡Desbloqueaste tu premio! Revisalo en la sección Premios.
        </p>
      )}

      <Link
        href="/collection"
        className="mt-4 w-full max-w-sm rounded-2xl bg-brand-500 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98]"
      >
        VER COLECCIÓN
      </Link>
    </main>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 16 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="absolute top-1/4 h-2 w-2 animate-pop-in rounded-sm"
          style={{
            left: `${(i / pieces.length) * 100}%`,
            backgroundColor: ["#f97316", "#a3e635", "#fbbf24", "#c084fc"][
              i % 4
            ],
            animationDelay: `${i * 30}ms`,
          }}
        />
      ))}
    </div>
  );
}
