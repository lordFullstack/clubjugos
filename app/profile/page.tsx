import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCustomerHistory,
} from "@/services/customer-service";
import { logout } from "@/services/auth-service";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard } from "@/components/ticket-card";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCustomerProfile();
  const history = await getCustomerHistory();

  return (
    <main className="min-h-screen bg-paper-100 px-6 pb-32 pt-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-card">
          🙂
        </div>
        <h1 className="mt-3 font-display text-xl font-extrabold text-ink-900">
          {profile?.name ?? "Cliente"}
        </h1>
        <p className="text-sm text-ink-500">{profile?.phone}</p>
        {profile?.email && (
          <p className="text-sm text-ink-500">{profile.email}</p>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
          Historial
        </h2>
        {history.length === 0 ? (
          <TicketCard className="mt-3 px-4 pb-4 text-center text-sm text-ink-500">
            Todavía no tienes actividad. ¡Escanea tu primer QR!
          </TicketCard>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-card"
              >
                <span className="font-medium text-ink-900">
                  Obtuviste: {item.stickerName}
                </span>
                <span className="font-mono text-xs text-ink-500">
                  {new Date(item.obtainedAt).toLocaleDateString("es-CO")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={logout} className="mt-8">
        <button
          type="submit"
          className="w-full rounded-2xl border-2 border-ink-900/[0.06] bg-white py-3.5 text-sm font-bold text-ink-700 shadow-card transition active:scale-[0.98]"
        >
          Cerrar sesión
        </button>
      </form>

      <BottomNav />
    </main>
  );
}
