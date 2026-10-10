"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type SegmentedTab = {
  id: string;
  label: string;
  /** Contador opcional junto a la etiqueta (se oculta si es 0/undefined). */
  count?: number;
  content: ReactNode;
};

/**
 * Pestañas tipo "píldora" del mockup (Disponibles / Mis premios). El
 * contenido de cada pestaña llega ya renderizado desde el servidor, así que
 * cambiar de pestaña no hace ninguna petición: solo muestra uno u otro.
 * Accesible: `role="tablist"`, flechas ←/→ para moverse, y el panel se
 * asocia con su pestaña por `aria-controls`/`aria-labelledby`.
 */
export function SegmentedTabs({
  tabs,
  defaultId,
}: {
  tabs: SegmentedTab[];
  defaultId?: string;
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultId ?? tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const nextTab = tabs[next]!;
    setActiveId(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex gap-2">
        {tabs.map((tab, i) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold transition active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-citrus-500 ${
                selected
                  ? "bg-citrus-600 text-white shadow-card"
                  : "bg-white text-ink-500 ring-1 ring-ink-900/5"
              }`}
            >
              {tab.label}
              {!!tab.count && (
                <span
                  className={`rounded-full px-1.5 font-mono text-[11px] ${
                    selected ? "bg-white/20 text-white" : "bg-citrus-50 text-citrus-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${active.id}`}
          aria-labelledby={`${baseId}-tab-${active.id}`}
          className="mt-5"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
