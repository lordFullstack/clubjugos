import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QrScanner } from "@/components/qr-scanner";
import { Toast } from "@/components/ui/toast";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await searchParams;

  return (
    // Mockup: la pantalla de escaneo es prácticamente negra, no verde
    // (a diferencia de Home) — así resalta más el visor de la cámara.
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-900 px-6 py-10 text-center">
      <div>
        <h1 className="font-display text-xl font-extrabold text-white">
          Escanea el QR de tu compra
        </h1>
        <p className="mt-1 text-sm text-white/70">
          Apunta la cámara al código que te muestra el mesero
        </p>
      </div>

      {error && (
        <Toast tone="dark" className="w-full max-w-sm">
          {error}
        </Toast>
      )}

      <QrScanner />
    </main>
  );
}
