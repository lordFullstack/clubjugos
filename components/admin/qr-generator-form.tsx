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
  const [quantity, setQuantity] = useState(10);
  const [expiresHours, setExpiresHours] = useState(24);
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await adminGenerateQrTokens(quantity, expiresHours);

      if (!result.success) {
        setError(result.error);
        return;
      }

      const siteUrl = window.location.origin;
      const withImages = await Promise.all(
        result.tokens.map(async (t) => ({
          token: t.token,
          expiresAt: t.expiresAt,
          imageDataUrl: await QRCode.toDataURL(`${siteUrl}/scan/${t.token}`, {
            width: 240,
            margin: 1,
          }),
        })),
      );
      setItems(withImages);
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm font-semibold text-ink-700">
            Cantidad
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-ink-700">
            Expira en (horas)
            <input
              type="number"
              min={1}
              value={expiresHours}
              onChange={(e) => setExpiresHours(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            />
          </label>
        </div>

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

      {items.length > 0 && (
        <div>
          <p className="text-sm font-bold text-ink-900">
            {items.length} códigos generados
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.token}
                className="rounded-2xl bg-white p-3 text-center shadow-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageDataUrl}
                  alt={`QR ${item.token}`}
                  className="mx-auto h-28 w-28"
                />
                <p className="mt-2 break-all font-mono text-xs font-bold text-ink-900">
                  {item.token}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-500">
                  Vence: {new Date(item.expiresAt).toLocaleString("es-CO")}
                </p>
                <p className="mt-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  AVAILABLE
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
