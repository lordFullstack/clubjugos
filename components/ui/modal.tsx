"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Modal/BottomSheet base del design system. Pensado para servir de
 * fundación al `StickerRevealModal` del LOOP 03 (y a cualquier otro modal
 * futuro: detalle de sticker, confirmaciones), sin duplicar la mecánica de
 * accesibilidad en cada uno.
 *
 * - `role="dialog"` + `aria-modal="true"` + label obligatorio.
 * - Mueve el foco al contenido al abrir y lo devuelve al disparador al cerrar.
 * - Cierra con ESC y con click en el overlay, salvo que se desactive
 *   explícitamente (`closeOnEsc`/`closeOnBackdrop` en false) — por ejemplo,
 *   mientras el LOOP 03 pide no dejar cerrar el modal de recompensa antes de
 *   que la animación termine de "comprometerse" con lo que el cliente ganó.
 * - No impone animación propia: el consumidor decide (para respetar
 *   `prefers-reduced-motion`, se recomienda condicionar la clase de entrada
 *   con la media query en vez de animar siempre).
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  closeOnEsc = true,
  closeOnBackdrop = true,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  /** Usado como aria-label del dialog; no se renderiza visualmente por defecto. */
  title: string;
  children: ReactNode;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    contentRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && closeOnEsc) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl bg-white shadow-card outline-none ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
