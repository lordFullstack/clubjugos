"use client";

import { useEffect, useState } from "react";

/**
 * LOOP 06 — "sin conexión temporal": a diferencia de `app/offline/page.tsx`
 * (la pantalla de respaldo del service worker cuando una *navegación*
 * completa falla), este banner cubre el caso de perder la conexión
 * mientras ya estás usando la app sin navegar a ningún lado — una acción
 * como canjear un premio puede fallar en silencio si no hay nada que avise.
 *
 * Nunca afirma que algo se procesó: solo informa el estado de la conexión.
 */
export function ConnectivityBanner() {
  const [online, setOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    function handleOnline() {
      setOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 2500);
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !justReconnected) return null;

  return (
    <div
      role="status"
      className={`fixed inset-x-0 top-0 z-[60] px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-center text-xs font-bold ${
        online ? "bg-jade-500 text-white" : "bg-ink-900 text-white"
      }`}
    >
      {online
        ? "Conexión recuperada"
        : "Sin conexión — lo que hagas ahora puede no guardarse hasta que vuelva."}
    </div>
  );
}
