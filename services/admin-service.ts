import { createClient } from "@/lib/supabase/server";

export type AdminKpis = {
  total_customers: number;
  total_scans: number;
  stickers_delivered: number;
  stickers_duplicated: number;
  completed_collections: number;
  prizes_unlocked: number;
  prizes_redeemed: number;
  active_customers_7d: number;
};

export async function getAdminKpis(): Promise<AdminKpis | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("admin_kpis").select("*").maybeSingle();
  return data;
}

export type RecentActivity = {
  id: string;
  customerName: string;
  stickerName: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
};

const FAILURE_LABEL: Record<string, string> = {
  QR_NOT_FOUND: "QR inválido",
  QR_USED: "QR ya utilizado",
  QR_EXPIRED: "QR expirado",
  QR_CANCELLED: "QR cancelado",
  CAMPAIGN_INACTIVE: "Campaña inactiva",
  NO_STICKERS_CONFIGURED: "Sin stickers configurados",
};

export async function getRecentActivity(
  limit = 15,
): Promise<RecentActivity[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("scan_events")
    .select("id, success, failure_reason, created_at, profiles(name), stickers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const sticker = Array.isArray(row.stickers) ? row.stickers[0] : row.stickers;
    return {
      id: row.id,
      customerName: profile?.name ?? "Cliente",
      stickerName: sticker?.name ?? null,
      success: row.success,
      failureReason: row.failure_reason
        ? (FAILURE_LABEL[row.failure_reason] ?? row.failure_reason)
        : null,
      createdAt: row.created_at,
    };
  });
}
