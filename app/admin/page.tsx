import { getAdminKpis, getRecentActivity } from "@/services/admin-service";

export default async function AdminDashboardPage() {
  const kpis = await getAdminKpis();
  const activity = await getRecentActivity();

  const cards = [
    { label: "Clientes registrados", value: kpis?.total_customers ?? 0 },
    { label: "Escaneos exitosos", value: kpis?.total_scans ?? 0 },
    { label: "Stickers entregados", value: kpis?.stickers_delivered ?? 0 },
    { label: "Stickers repetidos", value: kpis?.stickers_duplicated ?? 0 },
    { label: "Colecciones completadas", value: kpis?.completed_collections ?? 0 },
    { label: "Premios desbloqueados", value: kpis?.prizes_unlocked ?? 0 },
    { label: "Premios canjeados", value: kpis?.prizes_redeemed ?? 0 },
    { label: "Activos últimos 7 días", value: kpis?.active_customers_7d ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Dashboard
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-4 shadow-card"
          >
            <p className="text-2xl font-extrabold text-ink-900">
              {card.value}
            </p>
            <p className="mt-1 text-xs font-medium text-ink-500">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-ink-500">
        Actividad reciente
      </h2>
      {activity.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
          Todavía no hay actividad registrada.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {activity.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">
                  {item.customerName}
                </p>
                <p
                  className={`text-xs ${item.success ? "text-ink-500" : "text-red-500"}`}
                >
                  {item.success
                    ? `Obtuvo: ${item.stickerName}`
                    : item.failureReason}
                </p>
              </div>
              <span className="shrink-0 text-xs text-ink-500">
                {new Date(item.createdAt).toLocaleString("es-CO")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
