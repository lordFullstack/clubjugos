import { createClient } from "@/lib/supabase/server";

export type CampaignRow = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  completion_target: number;
  status: "draft" | "active" | "finished" | "archived";
};

export async function getCampaigns(businessId: string): Promise<CampaignRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select(
      "id, name, description, start_date, end_date, completion_target, status",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
