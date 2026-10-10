import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerProfile,
  getCustomerHistory,
  getCurrentCollection,
  getCampaignSpecials,
  getCustomerPrizes,
} from "@/services/customer-service";
import { logout } from "@/services/auth-service";
import { BottomNav } from "@/components/bottom-nav";
import { TicketCard, TicketDivider } from "@/components/ticket-card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/progress-bar";
import { IconAlbum, IconPrize } from "@/components/icons";

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white px-2 py-3 text-center shadow-card">
      <p className="font-display text-xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-ink-500">{label}</p>
    </div>
  );
}

function MenuRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card transition active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-citrus-50 text-citrus-600">
        {icon}
      </span>
      <span className="flex-1 font-semibold text-ink-900">{label}</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-ink-500"
        aria-hidden
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

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
    getCustomerHistory(user.id),
  ]);

  // getCurrentCollection ya necesita el business_id del perfil, así que va
  // después del Promise.all de arriba (no puede pedirse en paralelo con él).
  const businessId = profile?.business_id ?? null;
  const [{ campaign, obtainedCount }, specials, prizes] = await Promise.all([
    getCurrentCollection(businessId, user.id),
    getCampaignSpecials(businessId, user.id),
    getCustomerPrizes(businessId, user.id),
  ]);
  const specialsWon = specials.filter((sp) => sp.obtained).length;
  const prizesAvailable = prizes.filter((pr) => pr.status === "AVAILABLE").length;
  const target = campaign?.completion_target ?? 0;
  const progressPct = target > 0 ? Math.round((obtainedCount / target) * 100) : 0;

  return (
    <main className="min-h-screen bg-paper-100 px-6 pb-32 pt-8">
      <div className="flex flex-col items-center text-center">
        <Avatar src={profile?.avatar_url} name={profile?.name} size="lg" />
        <h1 className="mt-3 font-display text-xl font-extrabold text-ink-900">
          {profile?.name ?? "Cliente"}
        </h1>
        <p className="text-sm text-ink-500">{profile?.phone}</p>
        {profile?.email && (
          <p className="text-sm text-ink-500">{profile.email}</p>
        )}
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3" aria-label="Resumen">
        <StatTile value={campaign ? `${obtainedCount}/${target}` : "–"} label="Stickers" />
        <StatTile
          value={specials.length > 0 ? `${specialsWon}/${specials.length}` : "–"}
          label="Especiales"
        />
        <StatTile value={String(prizesAvailable)} label="Premios" />
      </section>

      <nav className="mt-4 space-y-2" aria-label="Accesos">
        <MenuRow
          href="/collection"
          label="Mis stickers"
          icon={<IconAlbum className="h-5 w-5" strokeWidth={1.8} />}
        />
        <MenuRow
          href="/prizes"
          label="Mis premios"
          icon={<IconPrize className="h-5 w-5" strokeWidth={1.8} />}
        />
      </nav>

      {campaign && (
        <section className="mt-8">
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
