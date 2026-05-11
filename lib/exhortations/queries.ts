import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { DailyExhortationRow } from "./types";

const EXHORTATION_SELECT = "id,exhortation_date,title,message,audio_url,created_at";

export async function getTodayExhortation(): Promise<DailyExhortationRow | null> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("daily_exhortations")
    .select(EXHORTATION_SELECT)
    .eq("exhortation_date", today)
    .maybeSingle();

  if (error) {
    console.error("getTodayExhortation", error);
    return null;
  }

  if (data) {
    return data as DailyExhortationRow;
  }

  const { data: fallback, error: fallbackError } = await supabase
    .from("daily_exhortations")
    .select(EXHORTATION_SELECT)
    .order("exhortation_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fallbackError) {
    console.error("getTodayExhortation:fallback", fallbackError);
    return null;
  }

  return (fallback as DailyExhortationRow | null) ?? null;
}

export async function listRecentExhortations(limit = 6): Promise<DailyExhortationRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("daily_exhortations")
    .select(EXHORTATION_SELECT)
    .order("exhortation_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listRecentExhortations", error);
    return [];
  }

  return (data ?? []) as DailyExhortationRow[];
}
