import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCustomerHistory,
  getCurrentCollection,
} from "@/services/customer-service";
import { logout } from "@/services/auth-service";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard, TicketDivider } from "@/components/ticket-card";
import { IconAvatar } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, history] = await Promise.all([
    getCustomerProfile(user.id),
    getCustomerHistory(),
  ]);

  // getCurrentCollection ya necesita el business_id del perfil, así que va
  // después del Promise.all de arriba (no puede pedirse en paralelo con él).
  const { campaign, obtainedCount } = await getCurrentCollection(
    profile?.business_id ?? null,
  );
  const target = campaign?.completion_target ?? 0;
  const progressPct = target > 0 ? Math.round((obtainedCount / target) * 100) : 0;

  return (
    <main className="min-h-screen bg-paper-100 px-6 pb-32 pt-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-citrus-500 shadow-card">
          <IconAvatar className="h-9 w-9" strokeWidth={1.6} />
        </div>
        <h1 className="mt-3 font-display text-xl font-extrabold text-ink-900">
          {profile?.name ?? "Cliente"}
        </h1>
        <p className="text-sm text-ink-500">{profile?.phone}</p>
        {profile?.email && (
          <p className="text-sm text-ink-500">{profile.email}</p>
        )}
      </div>

      {campaign && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
            Progreso
          </h2>
          <TicketCard className="mt-3 px-4 pb-4">
            <p className="font-semibold text-ink-900">{campaign.name}</p>
            <TicketDivider className="mt-2 pt-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-mono font-bold text-ink-900">
                  {obtainedCount} / {target}
                </span>
                <span className="font-semibold text-ink-500">stickers</span>
              </div>
              <ProgressBar percent={progressPct} />
            </TicketDivider>
          </TicketCard>
        </section>
      )}

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
        <Button type="submit" variant="secondary">
          Cerrar sesión
        </Button>
      </form>

      <BottomNav />
    </main>
  );
}
