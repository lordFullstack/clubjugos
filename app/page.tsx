import Link from "next/link";

const PREVIEW_STICKERS = ["🍓", "🥭", "🍊", "🍍"];

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-paper-100 px-6 py-10">
      {/* Rayo de sol tipo etiqueta de caja de cítricos, detrás del logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_0deg,theme(colors.citrus.200)_0deg,transparent_18deg,transparent_342deg,theme(colors.citrus.200)_360deg)] opacity-60"
      />

      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <span className="rounded-full border-2 border-dashed border-citrus-400 px-4 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-citrus-600">
          Club de clientes frecuentes
        </span>

        <h1 className="mt-6 font-display text-5xl font-black italic tracking-tight text-ink-900">
          Jugo<span className="text-citrus-500">Club</span>
        </h1>

        <p className="mt-3 max-w-xs text-balance text-lg font-medium text-ink-700">
          Compra. Coleccioná. Ganá.
        </p>

        {/* Boleta con stickers de vista previa — establece la metáfora del álbum */}
        <div className="relative mt-9 w-full max-w-[280px] animate-float overflow-hidden rounded-4xl bg-white pt-4 shadow-ticket">
          <div className="ticket-notch-top" aria-hidden />
          <p className="px-5 text-left font-display text-xs font-bold uppercase tracking-wide text-citrus-500">
            Tu primera boleta
          </p>
          <div className="mt-3 flex justify-center gap-3 px-5 pb-5">
            {PREVIEW_STICKERS.map((emoji, i) => (
              <div
                key={emoji}
                className="flex h-14 w-14 animate-pop-in items-center justify-center rounded-2xl bg-paper-100 text-2xl ring-2 ring-ink-900/5"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA principal */}
      <div className="relative w-full max-w-sm space-y-3 self-center pb-4">
        <Link
          href="/register"
          className="block w-full rounded-2xl bg-gradient-to-b from-citrus-400 to-citrus-600 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98]"
        >
          COMENZAR
        </Link>
        <Link
          href="/login"
          className="block w-full py-2 text-center text-sm font-bold text-ink-500"
        >
          Ya tengo una cuenta
        </Link>
      </div>
    </main>
  );
}
