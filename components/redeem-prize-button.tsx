"use client";

import { useState, useTransition } from "react";
import { redeemPrize } from "@/services/redemption-service";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

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
      <Button type="button" size="sm" onClick={() => setConfirming(true)}>
        Canjear
      </Button>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
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
        >
          {isPending ? "Canjeando..." : "Confirmar"}
        </Button>
      </div>
      {error && (
        <Toast kind="error" className="px-2.5 py-1 text-[11px]">
          {error}
        </Toast>
      )}
    </div>
  );
}
