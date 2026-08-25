"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silencioso: si falla el registro, la app sigue funcionando normal,
        // solo sin capacidad de instalación/offline.
      });
    }
  }, []);

  return null;
}
