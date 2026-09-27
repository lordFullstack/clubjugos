"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IconGift, IconAlbum } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { getRarityMeta } from "@/components/ui/rarity";
import { TicketCard, TicketDivider } from "@/components/ticket-card";
import { ProgressBar } from "@/components/progress-bar";

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

/**
 * LOOP 03 — modal de revelación reutilizable.
 *
 * Reemplaza a `RewardReveal` (que era una pantalla completa, no un modal, y
 * mezclaba una cuenta regresiva de ~2.1s con el resultado). Este componente
 * SOLO presenta lo que el servidor ya decidió: nunca elige qué sticker cayó
 * ni si hay premio — eso ya se resolvió en `redeem_qr_token` antes de llegar
 * acá (ver services/scan-service.ts).
 *
 * Sigue viviendo dentro de `app/reward/page.tsx` (misma ruta y mismo
 * contrato de query params que ya existía — ver AUDIT.md: ese contrato se
 * mantiene por ahora a propósito, cambiarlo es alcance del LOOP 08) pero
 * ahora se renderiza como un overlay + card centrada de verdad, con
 * `role="dialog"`, en vez de ocupar toda la pantalla.
 */
export function StickerRevealModal({
  sticker,
  collectionComplete,
  obtainedCount,
  completionTarget,
  prizeUnlocked,
  special,
}: Props) {
  const router = useRouter();
  const hasReveal = !!sticker || !!special;
  const anyPrizeUnlocked = prizeUnlocked || (special?.prizeUnlocked ?? false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!hasReveal || reducedMotion || !("vibrate" in navigator)) return;
    const isRare =
      (sticker && ["RARE", "EPIC", "LEGENDARY"].includes(sticker.rarity)) ||
      !!special;
    navigator.vibrate(anyPrizeUnlocked ? [40, 80, 40, 80, 160] : isRare ? [40, 60, 90] : 40);
    // Solo debe vibrar una vez, al montar el resultado — no en cada re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cerrar el modal nunca le cuesta la recompensa al cliente: ya quedó
  // otorgada en el servidor antes de esta pantalla. ESC/backdrop llevan a
  // /home, igual que el CTA secundario "CONTINUAR".
  function handleClose() {
    router.push("/home");
  }

  const primaryHref = anyPrizeUnlocked ? "/prizes" : "/collection";
  const primaryLabel = anyPrizeUnlocked ? "VER MIS PREMIOS" : "VER MI ÁLBUM";

  // LOOP 05: cuando el especial trae premio, ese es el titular del modal
  // ("¡PREMIO ESPECIAL!"), por encima incluso de un coleccionable nuevo en
  // el mismo escaneo. Un especial repetido (sin premio nuevo) mantiene el
  // encabezado genérico de LOOP 03.
  const headline = special?.prizeUnlocked
    ? "¡PREMIO ESPECIAL!"
    : !sticker && special
      ? "¡TE SALIÓ UN ESPECIAL!"
      : "¡LO CONSEGUISTE!";

  return (
    <Modal
      open
      onClose={handleClose}
      title={hasReveal ? "Resultado de tu escaneo" : "Sin novedades esta vez"}
      className="max-w-sm"
    >
      <TicketCard tone="jade" className="px-6 pb-6 text-center">
        {!hasReveal ? (
          <NoLuckContent onClose={handleClose} />
        ) : (
          <>
            <p
              className={`font-display text-xl font-extrabold ${
                reducedMotion ? "" : "animate-tear-in"
              }`}
            >
              {headline}
            </p>

            {sticker && (
              <StickerBlock sticker={sticker} reducedMotion={reducedMotion} />
            )}

            {!sticker && collectionComplete && (
              <p className="mt-3 text-sm text-white/70">
                Tu álbum ya está completo 🎉
              </p>
            )}

            {sticker && (
              <TicketDivider className="mt-4 pt-4">
                <p className="text-sm text-white/70">
                  Ya tienes {obtainedCount} de {completionTarget}
                </p>
                <ProgressBar
                  percent={
                    completionTarget > 0
                      ? Math.round((obtainedCount / completionTarget) * 100)
                      : 0
                  }
                />
              </TicketDivider>
            )}

            {special && <SpecialBlock special={special} reducedMotion={reducedMotion} />}

            {prizeUnlocked && (
              <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foil-light bg-white/10 px-4 py-3 text-sm font-bold text-foil-light">
                <IconGift className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                ¡Desbloqueaste tu premio! Revísalo en la sección Premios.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <Button href={primaryHref}>{primaryLabel}</Button>
              <Button variant="outline-invert" onClick={handleClose}>
                CONTINUAR
              </Button>
            </div>
          </>
        )}
      </TicketCard>
    </Modal>
  );
}

function NoLuckContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-2">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
        <IconGift className="h-9 w-9 text-white/60" strokeWidth={1.4} />
      </div>
      <p className="mt-3 font-display text-lg font-extrabold">
        Esta vez no hubo suerte
      </p>
      <p className="mt-1 text-sm text-white/70">
        Ya completaste tu álbum. Sigue escaneando en cada compra — tienes
        oportunidad de ganar premios especiales mientras la campaña siga
        activa.
      </p>
      <Button variant="outline-invert" className="mt-5" onClick={onClose}>
        VOLVER AL INICIO
      </Button>
    </div>
  );
}

/** Rareza -> qué tan "cargada" es la microanimación de entrada del sticker. */
function revealTreatment(rarity: string): { shine: boolean; confetti: number } {
  switch (rarity) {
    case "RARE":
      return { shine: true, confetti: 0 };
    case "EPIC":
      return { shine: true, confetti: 10 };
    case "LEGENDARY":
      return { shine: true, confetti: 14 };
    default:
      // COMMON / UNCOMMON: animación corta, sin brillo ni partículas.
      return { shine: false, confetti: 0 };
  }
}

function StickerBlock({
  sticker,
  reducedMotion,
}: {
  sticker: StickerInfo;
  reducedMotion: boolean;
}) {
  const meta = getRarityMeta(sticker.rarity);
  const { shine, confetti } = revealTreatment(sticker.rarity);

  return (
    <div className="relative mt-3">
      {confetti > 0 && !reducedMotion && <ConfettiBurst count={confetti} />}
      <div
        className={`foil-shine ${shine && !reducedMotion ? "play" : ""} relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-4xl bg-white shadow-soft ring-4 ${meta.ring} ${meta.glow} ${
          reducedMotion ? "" : "animate-reveal-pop"
        }`}
      >
        {sticker.imageUrl ? (
          <Image
            src={sticker.imageUrl}
            alt={sticker.name}
            width={128}
            height={128}
            className="object-contain"
          />
        ) : (
          <IconAlbum className="h-12 w-12 text-citrus-300" strokeWidth={1.4} />
        )}
      </div>

      <div className="mt-3">
        <RarityBadge rarity={sticker.rarity} tone="dark" size="md" />
        <p className="mt-1 font-display text-xl font-extrabold">{sticker.name}</p>
      </div>
    </div>
  );
}

function SpecialBlock({
  special,
  reducedMotion,
}: {
  special: SpecialInfo;
  reducedMotion: boolean;
}) {
  return (
    <div className="relative mt-4 w-full rounded-3xl border-2 border-dashed border-foil-light bg-white/10 p-5">
      {!reducedMotion && <ConfettiBurst count={12} />}
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-foil-light">
        {special.isDuplicate ? "⚡ Especial · DUPLICADO" : "⚡ Premio especial"}
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <div
          className={`foil-shine play relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ${
            reducedMotion ? "" : "animate-reveal-pop"
          }`}
        >
          {special.imageUrl ? (
            <Image
              src={special.imageUrl}
              alt={special.name}
              width={56}
              height={56}
              className="object-contain"
            />
          ) : (
            <IconGift className="h-7 w-7 text-foil-light" strokeWidth={1.6} />
          )}
        </div>
        <p className="font-display text-lg font-extrabold">{special.name}</p>
      </div>
      {special.isDuplicate && (
        <p className="mt-2 text-xs text-white/60">
          Ya tenías este especial — no cuenta para el álbum, pero sigue sumando suerte.
        </p>
      )}
      {special.prizeUnlocked && special.prizeName && (
        <>
          <p className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-foil-light">
            <IconGift className="h-5 w-5 shrink-0" strokeWidth={1.8} />
            ¡Ganaste: {special.prizeName}!
          </p>
          <span className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foil-light">
            Estado: Disponible
          </span>
        </>
      )}
    </div>
  );
}

function ConfettiBurst({ count }: { count: number }) {
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
        delay: Math.random() * 400,
        duration: 1 + Math.random() * 0.7,
        size: 5 + Math.round(Math.random() * 5),
        color: colors[i % colors.length]!,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
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
