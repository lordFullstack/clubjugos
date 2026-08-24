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

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  stickerCount: number;
  lastActivity: string | null;
};

export async function getBusinessCustomers(
  businessId: string,
): Promise<CustomerRow[]> {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("id, name, phone, email")
    .eq("business_id", businessId)
    .eq("role", "CUSTOMER")
    .order("created_at", { ascending: false });

  if (!customers || customers.length === 0) return [];

  const ids = customers.map((c) => c.id);

  const { data: stickers } = await supabase
    .from("customer_stickers")
    .select("customer_id, obtained_at")
    .in("customer_id", ids);

  const countByCustomer = new Map<string, number>();
  const lastByCustomer = new Map<string, string>();
  for (const row of stickers ?? []) {
    countByCustomer.set(
      row.customer_id,
      (countByCustomer.get(row.customer_id) ?? 0) + 1,
    );
    const prev = lastByCustomer.get(row.customer_id);
    if (!prev || row.obtained_at > prev) {
      lastByCustomer.set(row.customer_id, row.obtained_at);
    }
  }

  return customers.map((c) => ({
    ...c,
    stickerCount: countByCustomer.get(c.id) ?? 0,
    lastActivity: lastByCustomer.get(c.id) ?? null,
  }));
}

export type RedemptionRow = {
  id: string;
  customerName: string;
  prizeName: string;
  redeemedAt: string;
};

export async function getRedemptionHistory(
  limit = 50,
): Promise<RedemptionRow[]> {
  const supabase = await createClient();
  // redemptions tiene dos FKs hacia profiles (customer_id y operator_id),
  // por eso hay que indicar explícitamente cuál usar en el embed.
  const { data } = await supabase
    .from("redemptions")
    .select(
      "id, redeemed_at, profiles!redemptions_customer_id_fkey(name), prizes(name)",
    )
    .order("redeemed_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const prize = Array.isArray(row.prizes) ? row.prizes[0] : row.prizes;
    return {
      id: row.id,
      customerName: profile?.name ?? "Cliente",
      prizeName: prize?.name ?? "Premio",
      redeemedAt: row.redeemed_at,
    };
  });
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
