import { createClient } from "@/lib/supabase/server";

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  business_id: string | null;
};

/**
 * Recibe el id del usuario ya autenticado (la página que llama a esto ya
 * hizo su propio `auth.getUser()` para el redirect a /login, así que
 * pedirlo de nuevo aquí sería un viaje de red completo desperdiciado en
 * cada carga de página).
 */
export async function getCustomerProfile(
  userId: string,
): Promise<CustomerProfile | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, name, phone, email, business_id")
    .eq("id", userId)
    .single();

  return data;
}

export type CollectionSticker = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  obtained: boolean;
  duplicateCount: number;
};

export type CampaignCollection = {
  campaign: { id: string; name: string; completion_target: number } | null;
  stickers: CollectionSticker[];
  obtainedCount: number;
};

const EMPTY_COLLECTION: CampaignCollection = {
  campaign: null,
  stickers: [],
  obtainedCount: 0,
};

/**
 * Trae la campaña activa del negocio del cliente junto con el estado de su
 * colección (qué stickers tiene, cuáles le faltan, y cuántos duplicados).
 * Si el cliente todavía no pertenece a ningún negocio o no hay campaña
 * activa, devuelve un estado vacío en vez de fallar.
 */
export async function getCurrentCollection(
  businessId: string | null,
): Promise<CampaignCollection> {
  if (!businessId) return EMPTY_COLLECTION;

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name, completion_target")
    .eq("business_id", businessId)
    .eq("status", "active")
    .maybeSingle();

  if (!campaign) return EMPTY_COLLECTION;

  const { data: campaignStickers } = await supabase
    .from("campaign_stickers")
    .select("sticker_id, stickers!inner(id, name, image_url, rarity, kind)")
    .eq("campaign_id", campaign.id)
    .eq("status", "active")
    .eq("stickers.kind", "COLLECTIBLE");

  const { data: obtained } = await supabase
    .from("customer_stickers")
    .select("sticker_id")
    .eq("campaign_id", campaign.id);

  const countByStickerId = new Map<string, number>();
  for (const row of obtained ?? []) {
    countByStickerId.set(
      row.sticker_id,
      (countByStickerId.get(row.sticker_id) ?? 0) + 1,
    );
  }

  const stickers: CollectionSticker[] = (campaignStickers ?? []).map((cs) => {
    const sticker = Array.isArray(cs.stickers) ? cs.stickers[0] : cs.stickers;
    const count = countByStickerId.get(cs.sticker_id) ?? 0;
    return {
      id: sticker?.id ?? cs.sticker_id,
      name: sticker?.name ?? "Sticker",
      image_url: sticker?.image_url ?? null,
      rarity: sticker?.rarity ?? "COMMON",
      obtained: count > 0,
      duplicateCount: Math.max(count - 1, 0),
    };
  });

  return {
    campaign,
    stickers,
    obtainedCount: stickers.filter((s) => s.obtained).length,
  };
}

export type SpecialWin = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  count: number;
  obtainedAt: string;
};

/**
 * Stickers especiales que el cliente ya ganó (independientes del álbum).
 * Se agrupan por sticker porque un mismo especial puede caer más de una vez.
 */
export async function getSpecialWins(
  businessId: string | null,
): Promise<SpecialWin[]> {
  if (!businessId) return [];

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("business_id", businessId)
    .eq("status", "active")
    .maybeSingle();

  if (!campaign) return [];

  const { data } = await supabase
    .from("customer_stickers")
    .select("obtained_at, stickers!inner(id, name, image_url, rarity, kind)")
    .eq("campaign_id", campaign.id)
    .eq("stickers.kind", "SPECIAL")
    .order("obtained_at", { ascending: false });

  const byId = new Map<string, SpecialWin>();
  for (const row of data ?? []) {
    const sticker = Array.isArray(row.stickers) ? row.stickers[0] : row.stickers;
    if (!sticker) continue;
    const existing = byId.get(sticker.id);
    if (existing) {
      existing.count += 1;
    } else {
      byId.set(sticker.id, {
        id: sticker.id,
        name: sticker.name,
        image_url: sticker.image_url,
        rarity: sticker.rarity,
        count: 1,
        obtainedAt: row.obtained_at,
      });
    }
  }

  return Array.from(byId.values());
}

export type PrizeStatus = "LOCKED" | "AVAILABLE" | "REDEEMED" | "EXPIRED";

export type PrizeView = {
  id: string;
  name: string;
  description: string | null;
  required_stickers: number;
  status: PrizeStatus;
  customerPrizeId: string | null;
};

/**
 * El estado real de un premio (AVAILABLE/REDEEMED/EXPIRED) solo existe una
 * vez que el backend crea la fila en customer_prizes (Fase 8). Hasta que eso
 * ocurra, el premio se muestra como LOCKED, sin importar el progreso del
 * cliente: el frontend nunca decide por sí mismo si un premio está desbloqueado.
 */
export async function getCustomerPrizes(
  businessId: string | null,
): Promise<PrizeView[]> {
  if (!businessId) return [];

  const supabase = await createClient();

  const { data: prizes } = await supabase
    .from("prizes")
    .select("id, name, description, required_stickers")
    .eq("business_id", businessId)
    .eq("status", "active");

  const { data: customerPrizes } = await supabase
    .from("customer_prizes")
    .select("id, prize_id, status");

  const byPrizeId = new Map<string, { id: string; status: string }>(
    (customerPrizes ?? []).map((cp) => [cp.prize_id, { id: cp.id, status: cp.status }]),
  );

  return (prizes ?? []).map((prize) => {
    const cp = byPrizeId.get(prize.id);
    return {
      ...prize,
      status: (cp?.status as PrizeStatus) ?? "LOCKED",
      customerPrizeId: cp?.id ?? null,
    };
  });
}

export type HistoryItem = {
  id: string;
  stickerName: string;
  obtainedAt: string;
};

export async function getCustomerHistory(): Promise<HistoryItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("customer_stickers")
    .select("id, obtained_at, stickers(name)")
    .order("obtained_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => {
    const sticker = Array.isArray(row.stickers) ? row.stickers[0] : row.stickers;
    return {
      id: row.id,
      stickerName: sticker?.name ?? "Sticker",
      obtainedAt: row.obtained_at,
    };
  });
}
