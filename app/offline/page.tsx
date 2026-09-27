"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * LOOP 06 — pantalla de respaldo del service worker cuando una navegación
 * completa falla por falta de conexión (ver public/sw.js). A diferencia del
 * `ConnectivityBanner` (que cubre perder la conexión sin navegar), acá el
 * usuario ya se quedó sin la página que pidió.
 *
 * Importante: nunca afirma que un escaneo se procesó. Si esta pantalla
 * apareció después de intentar escanear un QR, ese escaneo NO llegó al
 * backend — se lo decimos explícitamente en vez de dejarlo ambiguo.
 */
export default function OfflinePage() {
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function handleRetry() {
    setRetrying(true);
    if (online) {
      router.replace("/home");
    } else {
      // Seguimos sin conexión: no tiene sentido navegar, solo lo avisamos.
      setTimeout(() => setRetrying(false), 600);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper-100 px-6 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          online ? "bg-jade-100" : "bg-ink-900/5"
        }`}
      >
        <span className="text-3xl">{online ? "📶" : "📡"}</span>
      </div>

      <p className="font-display text-2xl font-extrabold text-ink-900">
        {online ? "Ya tienes conexión" : "Sin conexión"}
      </p>

      <p className="max-w-xs text-sm text-ink-500">
        {online
          ? "Podés volver a la app. Si estabas escaneando un QR, ese escaneo no llegó a procesarse — tenés que intentarlo de nuevo."
          : "Esta pantalla no se pudo cargar porque no hay internet. Si estabas escaneando un QR, no se procesó todavía: tu progreso guardado está a salvo, pero ese escaneo puntual hay que reintentarlo cuando vuelva la conexión."}
      </p>

      <Button className="mt-2 max-w-xs" onClick={handleRetry} disabled={retrying && !online}>
        {online ? "VOLVER A LA APP" : retrying ? "SIGUE SIN CONEXIÓN..." : "REINTENTAR"}
      </Button>
    </main>
  );
}
