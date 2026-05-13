import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { FraternalEventRow } from "./event-types";

const SELECT =
  "id,title,description,starts_at,ends_at,meeting_url,registration_url,created_at";

/**
 * Liste les événements à venir (et récents) pour la timeline du calendrier fraternel.
 * Tri chronologique : du plus proche au plus lointain.
 */
export async function listFraternalEventsTimeline(limit = 50): Promise<FraternalEventRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("fraternal_events")
    .select(SELECT)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("listFraternalEventsTimeline", error);
    return [];
  }

  return (data ?? []) as FraternalEventRow[];
}
