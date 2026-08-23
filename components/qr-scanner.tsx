"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

type CameraStatus = "requesting" | "granted" | "denied" | "unsupported";

export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [status, setStatus] = useState<CameraStatus>("requesting");
  const [hasResult, setHasResult] = useState(false);

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
          setHasResult(true);
          stopCamera();
          router.push(path);
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
        icon="🚫"
        title="Tu navegador no soporta cámara"
        message="Probá abrir JugoClub desde Chrome o Safari actualizado."
      />
    );
  }

  if (status === "denied") {
    return (
      <EmptyState
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
      {!hasResult && (
        <div className="pointer-events-none absolute inset-8 rounded-2xl border-4 border-white/70" />
      )}
      {status === "requesting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
          Activando cámara...
        </div>
      )}
    </div>
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

function EmptyState({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 text-center shadow-card">
      <div className="text-4xl">{icon}</div>
      <p className="mt-2 font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{message}</p>
    </div>
  );
}
