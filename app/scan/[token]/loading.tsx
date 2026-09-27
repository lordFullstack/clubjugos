// LOOP 04: estado "procesando" del escáner. app/scan/[token]/page.tsx valida
// el QR contra la base de datos (redeem_qr_token) antes de redirigir a
// /reward o de vuelta a /scan con un error — sin este archivo, Next.js no
// mostraba nada propio durante esa validación.
export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-jade-900 px-6 text-center text-white">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/70">
        Procesando tu escaneo...
      </p>
    </main>
  );
}
