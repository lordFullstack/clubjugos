import { QrGeneratorForm } from "@/components/admin/qr-generator-form";
import { getRecentQrTokens, type QrTokenStatus } from "@/services/qr-service";

const STATUS_LABEL: Record<QrTokenStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "No utilizado", className: "bg-citrus-100 text-citrus-700" },
  USED: { label: "Utilizado", className: "bg-jade-100 text-jade-700" },
  EXPIRED: { label: "Expirado", className: "bg-red-50 text-red-500" },
  CANCELLED: { label: "Cancelado", className: "bg-ink-900/5 text-ink-500" },
};

export default async function AdminQrPage() {
  const tokens = await getRecentQrTokens();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Generar QR
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Cada código es de un solo uso, criptográficamente aleatorio, y expira
        automáticamente.
      </p>
      <QrGeneratorForm />

      {/* LOOP 07: estado de los QR — separado de "generar", como pide el
          pack. Lista en cards (no tabla ancha) para que sea legible en
          móvil/tablet sin scroll horizontal. */}
      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
          Últimos códigos generados
        </h2>

        {tokens.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
            Todavía no generaste ningún código.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tokens.map((t) => {
              const status = STATUS_LABEL[t.displayStatus];
              return (
                <li
                  key={t.token}
                  className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-bold text-ink-900">
                      {t.token}
                    </p>
                    <p className="text-xs text-ink-500">
                      {t.usedAt
                        ? `Usado: ${new Date(t.usedAt).toLocaleString("es-CO")}`
                        : `Vence: ${new Date(t.expiresAt).toLocaleString("es-CO")}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
