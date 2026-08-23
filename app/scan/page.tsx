import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QrScanner } from "@/components/qr-scanner";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-900 px-6 py-10 text-center">
      <div>
        <h1 className="font-display text-xl font-extrabold text-white">
          Escanea el QR de tu compra
        </h1>
        <p className="mt-1 text-sm text-white/70">
          Apunta la cámara al código que te muestra el mesero
        </p>
      </div>

      {error && (
        <p className="w-full max-w-sm rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200">
          {error}
        </p>
      )}

      <QrScanner />
    </main>
  );
}
