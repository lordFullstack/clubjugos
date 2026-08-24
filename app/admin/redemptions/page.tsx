import { getRedemptionHistory } from "@/services/admin-service";

export default async function AdminRedemptionsPage() {
  const redemptions = await getRedemptionHistory();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Canjes
      </h1>

      {redemptions.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
          Todavía no se ha canjeado ningún premio.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {redemptions.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">
                  {r.customerName}
                </p>
                <p className="text-xs text-ink-500">{r.prizeName}</p>
              </div>
              <span className="shrink-0 text-xs text-ink-500">
                {new Date(r.redeemedAt).toLocaleString("es-CO")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
