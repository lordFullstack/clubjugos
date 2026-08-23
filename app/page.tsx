import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-brand-50 via-brand-50 to-brand-100 px-6 py-12">
      {/* Decoración superior */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="animate-float text-7xl" role="img" aria-label="Vaso de jugo">
          🥤
        </div>

        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink-900">
          JUGO<span className="text-brand-500">CLUB</span>
        </h1>

        <p className="mt-3 max-w-xs text-balance text-lg font-medium text-ink-700">
          Compra. Colecciona. Gana.
        </p>

        {/* Preview de stickers para transmitir el concepto de colección */}
        <div className="mt-8 flex gap-3">
          {["🍓", "🥭", "🍊", "🍍"].map((emoji, i) => (
            <div
              key={emoji}
              className="flex h-14 w-14 animate-pop-in items-center justify-center rounded-2xl bg-white text-2xl shadow-card"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* CTA principal */}
      <div className="w-full max-w-sm space-y-3 pb-4">
        <Link
          href="/register"
          className="block w-full rounded-2xl bg-brand-500 py-4 text-center text-base font-bold text-white shadow-soft transition active:scale-[0.98] active:bg-brand-600"
        >
          COMENZAR
        </Link>
        <Link
          href="/login"
          className="block w-full py-2 text-center text-sm font-semibold text-ink-500"
        >
          Ya tengo una cuenta
        </Link>
      </div>
    </main>
  );
}
