import { createClient } from "@/lib/supabase/server";

export type AdminPrizeRow = {
  id: string;
  name: string;
  description: string | null;
  required_stickers: number;
  max_value: number | null;
  expires_days: number | null;
  status: "active" | "inactive";
};

export async function getBusinessPrizes(
  businessId: string,
): Promise<AdminPrizeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prizes")
    .select(
      "id, name, description, required_stickers, max_value, expires_days, status",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
