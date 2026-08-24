"use client";

import { useState } from "react";
import { PrizeForm } from "./prize-form";
import { togglePrizeActive } from "@/services/prize-admin-actions";
import type { AdminPrizeRow } from "@/services/prize-admin-service";

export function PrizeList({ prizes }: { prizes: AdminPrizeRow[] }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-3">
      {creating ? (
        <div>
          <PrizeForm />
          <button
            onClick={() => setCreating(false)}
            className="mt-2 text-sm font-semibold text-ink-500"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
        >
          + Nuevo premio
        </button>
      )}

      <div className="space-y-2">
        {prizes.map((prize) =>
          editingId === prize.id ? (
            <div key={prize.id}>
              <PrizeForm prize={prize} />
              <button
                onClick={() => setEditingId(null)}
                className="mt-2 text-sm font-semibold text-ink-500"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div
              key={prize.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                🎁
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink-900">{prize.name}</p>
                <p className="text-xs text-ink-500">
                  Requiere {prize.required_stickers} stickers
                  {prize.expires_days ? ` · vence en ${prize.expires_days}d` : ""}
                </p>
              </div>
              <button
                onClick={() =>
                  togglePrizeActive(prize.id, prize.status !== "active")
                }
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  prize.status === "active"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-ink-900/5 text-ink-500"
                }`}
              >
                {prize.status === "active" ? "Activo" : "Inactivo"}
              </button>
              <button
                onClick={() => setEditingId(prize.id)}
                className="shrink-0 text-xs font-semibold text-brand-600"
              >
                Editar
              </button>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
