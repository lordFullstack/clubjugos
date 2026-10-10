"use client";

import { useState } from "react";
import Image from "next/image";
import type { PrizeStatus, SpecialSticker } from "@/services/customer-service";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { TicketCard } from "@/components/ticket-card";
import { IconGift } from "@/components/icons";

/** Etiqueta "ESPECIAL": violeta, para que se distinga a simple vista de los
 * badges de rareza (verde/gris/azul/rosa/dorado) de los coleccionables. */
function SpecialPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-special-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-special-700 ${className}`}
    >
      ⚡ Especial
    </span>
  );
}

const PRIZE_STATUS: Record<PrizeStatus, { label: string; tone: BadgeTone }> = {
  LOCKED: { label: "Por ganar", tone: "neutral" },
  AVAILABLE: { label: "Disponible", tone: "success" },
  REDEEMED: { label: "Canjeado", tone: "neutral" },
  EXPIRED: { label: "Vencido", tone: "danger" },
};

function SpecialTile({
  special,
  onClick,
}: {
  special: SpecialSticker;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={special.obtained ? `Ver ${special.name}` : "Sticker especial bloqueado"}
        className="min-h-11 min-w-11 rounded-2xl transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-special-500"
      >
        <div
          className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl ${
            special.obtained
              ? "animate-pop-in bg-gradient-to-b from-special-100 to-white ring-2 ring-foil shadow-[0_0_0_3px_rgba(245,189,20,0.22)]"
              : "border-2 border-dashed border-special-500/30 bg-special-100/50"
          }`}
        >
          {special.obtained ? (
            special.image_url ? (
              <Image
                src={special.image_url}
                alt={special.name}
                width={56}
                height={56}
                className="object-contain"
              />
            ) : (
              <IconGift className="h-8 w-8 text-foil-dark" strokeWidth={1.6} />
            )
          ) : (
            <span className="text-2xl text-special-500/50" aria-hidden>
              ⚡
            </span>
          )}
          {special.obtained && special.count > 1 && (
            <span className="absolute right-1 top-1 rounded-full bg-ink-900/80 px-1.5 font-mono text-[10px] font-bold text-white">
              x{special.count}
            </span>
          )}
        </div>
      </button>
      <p className="max-w-[5.5rem] truncate text-center text-[11px] font-semibold text-ink-700">
        {special.obtained ? special.name : "Sin descubrir"}
      </p>
      <SpecialPill />
    </div>
  );
}

function SpecialDetailModal({
  special,
  onClose,
}: {
  special: SpecialSticker;
  onClose: () => void;
}) {
  const prize = special.prize;
  const prizeStatus = prize ? PRIZE_STATUS[prize.status] : null;

  // Bloqueado: no se revela cuál es el sticker (igual que los coleccionables),
  // pero sí qué premio da — esa lista ya es visible en /prizes.
  if (!special.obtained) {
    return (
      <Modal open onClose={onClose} title="Sticker especial bloqueado" className="max-w-xs">
        <div className="rounded-3xl bg-white p-6 text-center shadow-card">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-special-500/30 bg-special-100/50 text-3xl text-special-500/50">
            ⚡
          </div>
          <SpecialPill className="mt-3" />
          <p className="mt-2 font-semibold text-ink-900">Todavía no lo tienes</p>
          <p className="mt-1 text-sm text-ink-500">
            Los especiales caen por suerte en cualquier escaneo — no cuentan para
            completar el álbum.
          </p>
          {prize && (
            <p className="mt-3 rounded-2xl bg-special-100/60 px-3 py-2 text-sm font-semibold text-special-700">
              Premio por ganar: {prize.name}
            </p>
          )}
          <Button variant="secondary" className="mt-5" onClick={onClose}>
            CERRAR
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={special.name} className="max-w-xs">
      <div className="rounded-3xl bg-white p-6 text-center shadow-card">
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-special-100 to-white ring-4 ring-foil shadow-[0_0_0_4px_rgba(245,189,20,0.22)]">
          {special.image_url ? (
            <Image
              src={special.image_url}
              alt={special.name}
              width={112}
              height={112}
              className="object-contain"
            />
          ) : (
            <IconGift className="h-12 w-12 text-foil-dark" strokeWidth={1.4} />
          )}
        </div>

        <SpecialPill className="mt-3" />
        <p className="mt-1 font-display text-xl font-extrabold text-ink-900">
          {special.name}
        </p>
        {special.count > 1 && (
          <p className="mt-1 font-mono text-xs font-bold text-ink-500">
            Te ha salido {special.count} veces
          </p>
        )}

        {prize && prizeStatus && (
          <div className="mt-4 rounded-2xl bg-paper-100 p-3 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
              Premio asociado
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-bold text-ink-900">
                <IconGift className="h-5 w-5 shrink-0 text-foil-dark" strokeWidth={1.8} />
                {prize.name}
              </p>
              <Badge tone={prizeStatus.tone}>{prizeStatus.label}</Badge>
            </div>
          </div>
        )}

        {prize?.status === "AVAILABLE" ? (
          <Button
            href="/prizes"
            variant="gold"
            className="mt-5"
            aria-label="Ver premio"
          >
            VER PREMIO
          </Button>
        ) : (
          <Button variant="secondary" className="mt-5" onClick={onClose}>
            CERRAR
          </Button>
        )}
      </div>
    </Modal>
  );
}

/**
 * LOOP 05 — sección "Stickers especiales" del Álbum. Muestra los especiales
 * de la campaña (ganados y por descubrir) con tratamiento visual propio
 * (violeta + aro dorado) y el badge ESPECIAL; al tocar uno se ve su premio
 * y el estado de ese premio. Solo presenta lo que el backend ya decidió.
 */
export function SpecialAlbum({ specials }: { specials: SpecialSticker[] }) {
  const [selected, setSelected] = useState<SpecialSticker | null>(null);
  const won = specials.filter((s) => s.obtained).length;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold text-ink-900">
          Stickers especiales
        </h2>
        <span className="rounded-full bg-special-100 px-2.5 py-1 font-mono text-xs font-bold text-special-700">
          {won} / {specials.length}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-ink-500">
        Caen por suerte y traen premio. No cuentan para completar el álbum.
      </p>

      <TicketCard className="mt-3 px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {specials.map((special) => (
            <SpecialTile
              key={special.id}
              special={special}
              onClick={() => setSelected(special)}
            />
          ))}
        </div>
      </TicketCard>

      {selected && (
        <SpecialDetailModal special={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
