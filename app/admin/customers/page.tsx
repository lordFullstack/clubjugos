import { getAdminSession } from "@/lib/admin/get-admin-session";
import { getBusinessCustomers } from "@/services/admin-service";

export default async function AdminCustomersPage() {
  const result = await getAdminSession();
  const businessId = result.status === "ok" ? result.session.businessId : null;

  const customers = businessId ? await getBusinessCustomers(businessId) : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Clientes
      </h1>

      {customers.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
          Todavía no hay clientes registrados.
        </p>
      ) : (
        <>
          {/* LOOP 07: en desktop, tabla normal. En tablet/móvil (menos de
              `md`) una tabla ancha obliga a scroll horizontal o achica el
              texto hasta ilegible — se reemplaza por una lista de tarjetas
              con la misma información, sin perder nada. */}
          <div className="mt-6 hidden overflow-x-auto rounded-2xl bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Stickers</th>
                  <th className="px-4 py-3">Última actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink-900">
                      {c.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-500">
                      {c.phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-500">
                      {c.stickerCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-500">
                      {c.lastActivity
                        ? new Date(c.lastActivity).toLocaleDateString("es-CO")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 space-y-2 md:hidden">
            {customers.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl bg-white p-4 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-ink-900">{c.name}</p>
                  <span className="shrink-0 font-mono text-xs font-bold text-citrus-600">
                    {c.stickerCount} stickers
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-xs text-ink-500">
                  <span>{c.phone}</span>
                  <span>
                    {c.lastActivity
                      ? new Date(c.lastActivity).toLocaleDateString("es-CO")
                      : "Sin actividad"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
