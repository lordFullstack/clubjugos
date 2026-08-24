"use client";

import { useState, useTransition } from "react";
import { redeemPrize } from "@/services/redemption-service";

export function RedeemPrizeButton({
  customerPrizeId,
}: {
  customerPrizeId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (redeemed) {
    return (
      <span className="shrink-0 rounded-full bg-ink-900/5 px-2.5 py-1 text-xs font-bold text-ink-500">
        Canjeado
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="shrink-0 rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95"
      >
        Canjear
      </button>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink-700"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await redeemPrize(customerPrizeId);
              if (result.success) {
                setRedeemed(true);
              } else {
                setError(result.error);
                setConfirming(false);
              }
            });
          }}
          className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {isPending ? "Canjeando..." : "Confirmar"}
        </button>
      </div>
      {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}
