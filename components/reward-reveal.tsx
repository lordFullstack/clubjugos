"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconGift, IconAlbum } from "@/components/icons";

type StickerInfo = { name: string; imageUrl: string | null; rarity: string };
type SpecialInfo = {
  name: string;
  imageUrl: string | null;
  rarity: string;
  isDuplicate: boolean;
  prizeUnlocked: boolean;
  prizeName: string | null;
};

type Props = {
  sticker: StickerInfo | null;
  collectionComplete: boolean;
  obtainedCount: number;
  completionTarget: number;
  prizeUnlocked: boolean;
  special: SpecialInfo | null;
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

// Cuánto dura la explosión de confeti antes de mostrar qué se ganó.
const PRIZE_BURST_MS = 1900;

function RevealArt({
  imageUrl,
  ringLegendary,
}: {
  imageUrl: string | null;
  ringLegendary: boolean;
}) {
  return (
    <div
      className={`foil-shine play relative flex h-32 w-32 animate-pop-in items-center justify-center overflow-hidden rounded-4xl bg-white shadow-soft ${
        ringLegendary ? "ring-4 ring-foil" : ""
      }`}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" width={128} height={128} className="object-contain" />
      ) : (
        <IconAlbum className="h-12 w-12 text-citrus-300" strokeWidth={1.4} />
      )}
    </div>
  );
}

export function RewardReveal({
  sticker,
  collectionComplete,
  obtainedCount,
  completionTarget,
  prizeUnlocked,
  special,
}: Props) {
  const hasReveal = !!sticker || !!special;
  const prizeWon = prizeUnlocked || (special?.prizeUnlocked ?? false);
  const isRare =
    (sticker && ["RARE", "EPIC", "LEGENDARY"].includes(sticker.rarity)) ||
    !!special;

  // countdown -> (si cae premio) prizeBurst -> reveal
  const [phase, setPhase] = useState<"countdown" | "prizeBurst" | "reveal">(
    hasReveal ? "countdown" : "reveal",
  );
  const [count, setCount] = useState(hasReveal ? 3 : 0);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      setPhase(prizeWon ? "prizeBurst" : "reveal");
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(timer);
  }, [phase, count, prizeWon]);

  useEffect(() => {
    if (phase !== "prizeBurst") return;
    const timer = setTimeout(() => setPhase("reveal"), PRIZE_BURST_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!("vibrate" in navigator)) return;
    if (phase === "prizeBurst") {
      navigator.vibrate([40, 80, 40, 80, 160]);
    } else if (phase === "reveal" && !prizeWon && hasReveal) {
      navigator.vibrate(isRare ? [40, 60, 90] : 40);
    }
  }, [phase, prizeWon, isRare, hasReveal]);

  // Nada nuevo esta vez: álbum completo y no cayó ningún especial.
  if (!hasReveal) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-jade-900 px-6 text-center text-white">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
          <IconGift className="h-10 w-10 text-white/60" strokeWidth={1.4} />
        </div>
        <p className="font-display text-xl font-extrabold">
          Esta vez no hubo suerte
        </p>
        <p className="max-w-xs text-white/70">
          Ya completaste tu álbum. Sigue escaneando en cada compra — tienes
          oportunidad de ganar premios especiales mientras la campaña siga
          activa.
        </p>
        <Link
          href="/home"
          className="mt-4 w-full max-w-sm rounded-2xl bg-gradient-to-b from-citrus-400 to-citrus-600 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98]"
        >
          VOLVER AL INICIO
        </Link>
      </main>
    );
  }

  if (phase === "countdown") {
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

  // Explosión de confeti a pantalla completa, sin revelar todavía qué cayó.
  if (phase === "prizeBurst") {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-jade-900 px-6 text-center text-white">
        <ConfettiBurst count={36} />
        <p className="animate-pop-in font-display text-4xl font-black text-foil-light">
          🎉
        </p>
        <p className="mt-3 animate-tear-in font-display text-2xl font-extrabold">
          ¡GANASTE UN PREMIO!
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-jade-900 px-6 py-10 text-center text-white">
      {isRare && !prizeWon && <ConfettiBurst count={18} />}

      <p className="animate-tear-in font-display text-2xl font-extrabold">
        ¡LO CONSEGUISTE!
      </p>

      {sticker && (
        <>
          <RevealArt imageUrl={sticker.imageUrl} ringLegendary={sticker.rarity === "LEGENDARY"} />

          <div>
            <p
              className={`text-xs font-bold uppercase tracking-[0.2em] ${
                RARITY_COLOR[sticker.rarity] ?? RARITY_COLOR.COMMON
              }`}
            >
              {RARITY_LABEL[sticker.rarity] ?? "STICKER"}
            </p>
            <p className="mt-1 font-display text-xl font-extrabold">
              {sticker.name}
            </p>
          </div>

          <p className="text-white/70">
            Ya tienes {obtainedCount} de {completionTarget}
          </p>
        </>
      )}

      {!sticker && collectionComplete && (
        <p className="text-white/70">Tu álbum ya está completo 🎉</p>
      )}

      {special && (
        <div className="w-full max-w-sm rounded-3xl border-2 border-dashed border-foil-light bg-white/10 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foil-light">
            ⚡ Premio especial
          </p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
              {special.imageUrl ? (
                <Image src={special.imageUrl} alt="" width={56} height={56} className="object-contain" />
              ) : (
                <IconGift className="h-7 w-7 text-foil-light" strokeWidth={1.6} />
              )}
            </div>
            <p className="font-display text-lg font-extrabold">
              {special.name}
            </p>
          </div>
          {special.prizeUnlocked && special.prizeName && (
            <p className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-foil-light">
              <IconGift className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              ¡Ganaste: {special.prizeName}!
            </p>
          )}
        </div>
      )}

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

function ConfettiBurst({ count = 18 }: { count?: number }) {
  const colors = ["#e5511a", "#146356", "#c89b3c", "#e23e77", "#ffdfc7"];

  // Las posiciones se generan solo en el cliente (useEffect) para evitar un
  // mismatch de hidratación: Math.random() durante el render de SSR
  // produciría un HTML distinto al que arma el cliente al hidratar.
  const [pieces, setPieces] = useState<
    { left: number; delay: number; duration: number; size: number; color: string }[]
  >([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 500,
        duration: 1.2 + Math.random() * 0.9,
        size: 6 + Math.round(Math.random() * 6),
        color: colors[i % colors.length]!,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute -top-4 animate-confetti-fall rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
