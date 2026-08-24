import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaigns } from "@/services/campaign-service";
import { CampaignForm } from "@/components/admin/campaign-form";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  active: "Activa",
  finished: "Finalizada",
  archived: "Archivada",
};

export default async function AdminCampaignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, business_id")
    .eq("id", user!.id)
    .single();

  // Defensa en profundidad: aunque el menú lo oculte, un OPERATOR no puede
  // gestionar campañas navegando directo a esta URL.
  if (profile?.role !== "ADMIN") {
    redirect("/admin");
  }

  const campaigns = profile.business_id
    ? await getCampaigns(profile.business_id)
    : [];
  const active = campaigns.find((c) => c.status === "active") ?? null;
  const others = campaigns.filter((c) => c.id !== active?.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">
        Campaña
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        {active
          ? "Edita la temporada activa."
          : "No hay ninguna temporada activa. Crea una nueva."}
      </p>

      <div className="mt-6">
        <CampaignForm campaign={active} />
      </div>

      {others.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">
            Otras temporadas
          </h2>
          <ul className="mt-3 space-y-2">
            {others.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card"
              >
                <span className="font-semibold text-ink-900">{c.name}</span>
                <span className="rounded-full bg-ink-900/5 px-2.5 py-1 text-xs font-bold text-ink-500">
                  {STATUS_LABEL[c.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
