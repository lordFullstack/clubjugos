"use client";

import { useState, useTransition } from "react";
import QRCode from "qrcode";
import { adminGenerateQrTokens } from "@/services/qr-service";

type GeneratedItem = {
  token: string;
  expiresAt: string;
  imageDataUrl: string;
};

export function QrGeneratorForm() {
  const [expiresHours, setExpiresHours] = useState(24);
  const [item, setItem] = useState<GeneratedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await adminGenerateQrTokens(1, expiresHours);

      if (!result.success) {
        setError(result.error);
        return;
      }

      const t = result.tokens[0];
      if (!t) {
        setError("No se generó ningún código QR.");
        return;
      }

      const siteUrl = window.location.origin;
      setItem({
        token: t.token,
        expiresAt: t.expiresAt,
        imageDataUrl: await QRCode.toDataURL(`${siteUrl}/scan/${t.token}`, {
          width: 480,
          margin: 1,
        }),
      });
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <label className="block text-sm font-semibold text-ink-700">
          Expira en (horas)
          <input
            type="number"
            min={1}
            value={expiresHours}
            onChange={(e) => setExpiresHours(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm sm:max-w-xs"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={handleGenerate}
          className="mt-4 w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {isPending ? "Generando..." : "GENERAR QR"}
        </button>
      </div>

      {item && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageDataUrl}
              alt={`QR ${item.token}`}
              className="mx-auto h-72 w-72"
            />
            <p className="mt-4 break-all font-mono text-sm font-bold text-ink-900">
              {item.token}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Vence: {new Date(item.expiresAt).toLocaleString("es-CO")}
            </p>
            <p className="mt-2 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
              AVAILABLE
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setItem(null)}
                className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-bold text-ink-700 transition active:scale-[0.98]"
              >
                CERRAR
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending}
                className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
              >
                {isPending ? "Generando..." : "GENERAR OTRO"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
