import { createClient } from "@/lib/supabase/server";
import { getBusinessCustomers } from "@/services/admin-service";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user!.id)
    .single();

  const customers = profile?.business_id
    ? await getBusinessCustomers(profile.business_id)
    : [];

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
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-card">
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
      )}
    </div>
  );
}
