"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { EmptyState } from "@/components/ui/empty-state";

type CameraStatus = "requesting" | "granted" | "denied" | "unsupported";

// Cuánto se muestra la confirmación "QR detectado" antes de navegar —
// LOOP 04 pide un estado propio para este momento, no saltar directo de
// "escaneando" a la pantalla de recompensa.
const DETECTED_PAUSE_MS = 450;

export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [status, setStatus] = useState<CameraStatus>("requesting");
  const [detected, setDetected] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setStatus("granted");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        tick();
      })
      .catch(() => {
        if (!cancelled) setStatus("denied");
      });

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code?.data) {
        const path = extractScanPath(code.data);
        if (path) {
          setDetected(true);
          stopCamera();
          // Confirmación visual breve ("QR detectado") antes de navegar —
          // no bloquea: es más corta que cualquier transición de página.
          setTimeout(() => router.push(path), DETECTED_PAUSE_MS);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "unsupported") {
    return (
      <EmptyState
        className="mx-auto max-w-sm"
        icon="🚫"
        title="Tu navegador no soporta cámara"
        message="Probá abrir JugoClub desde Chrome o Safari actualizado."
      />
    );
  }

  if (status === "denied") {
    return (
      <EmptyState
        className="mx-auto max-w-sm"
        icon="🔒"
        title="Necesitamos permiso de cámara"
        message="Activá el permiso de cámara para JugoClub en la configuración de tu navegador y volvé a intentar."
      />
    );
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-black shadow-soft">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />
      {!detected && (
        <div className="pointer-events-none absolute inset-8 overflow-hidden rounded-2xl">
          {/* Esquinas tipo visor de cámara en vez de un marco parejo —
              comunica "encuadrá acá" sin tapar el centro del QR. */}
          <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-white" />
          <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-white" />
          <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-white" />
          <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-white" />
          <div className="absolute inset-x-0 top-0 h-0.5 animate-scan-line bg-citrus-400 shadow-[0_0_10px_2px_rgba(229,81,26,0.7)]" />
        </div>
      )}
      {status === "requesting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
          Activando cámara...
        </div>
      )}
      {detected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-jade-900/80 text-white">
          <div className="flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-jade-500">
            <CheckIcon className="h-8 w-8" strokeWidth={2.4} />
          </div>
          <p className="font-display text-sm font-extrabold uppercase tracking-wide">
            ¡QR detectado!
          </p>
        </div>
      )}
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

/**
 * Solo acepta QR que apunten a nuestra propia ruta /scan/TOKEN.
 * Cualquier otro QR (un link externo, por ejemplo) se ignora en silencio.
 */
function extractScanPath(rawValue: string): string | null {
  try {
    const url = new URL(rawValue);
    const match = url.pathname.match(/^\/scan\/([A-Za-z0-9]{6,20})$/);
    return match ? `/scan/${match[1]}` : null;
  } catch {
    return null;
  }
}
