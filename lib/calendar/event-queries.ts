import type { FraternalEventRow } from "./event-types";
import { createClient } from "@/utils/supabase/server";

const SELECT =
  "id,title,description,starts_at,ends_at,meeting_url,registration_url,created_at";

export type FraternalEventsQueryResult = {
  events: FraternalEventRow[];
  /**
   * `true` si aucune ligne n’a pu être lue (table absente, erreur PostgREST, RLS, clé anon, etc.).
   * Dans ce cas l’UI affiche un bandeau « Coming soon » au lieu d’une liste vide ambiguë.
   */
  readFailed: boolean;
};

/**
 * Événements fraternels pour la page Calendrier (`/calendar`).
 *
 * --- Appel SQL 1 (filtré) ---
 * `SELECT` colonnes listées sur `public.fraternal_events`
 * `WHERE starts_at >= :since` (hier UTC minuit : inclut la journée en cours et l’avenir)
 * `ORDER BY starts_at ASC` puis `LIMIT :limit`
 * → priorité aux événements les plus proches dans le temps.
 *
 * --- Appel SQL 2 (repli, même table) ---
 * Si le premier jeu de résultats est vide (ex. aucun futur en base mais des événements passés),
 * on relance un `SELECT` identique sans filtre de date, toujours `ORDER BY starts_at ASC`,
 * pour ne pas laisser la timeline vide alors que l’historique existe.
 */
export async function listFraternalEventsTimeline(limit = 80): Promise<FraternalEventsQueryResult> {
  const supabase = await createClient();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 1);
  since.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("fraternal_events")
    .select(SELECT)
    .gte("starts_at", since.toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("listFraternalEventsTimeline (fraternal_events) — échec requête filtrée:", error);
    return { events: [], readFailed: true };
  }

  const rows = (data ?? []) as FraternalEventRow[];

  if (rows.length > 0) {
    return { events: rows, readFailed: false };
  }

  /* Repli : même `FROM` / `SELECT`, sans `WHERE starts_at`, toujours tri chronologique ascendant. */
  const { data: allData, error: allErr } = await supabase
    .from("fraternal_events")
    .select(SELECT)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (allErr) {
    console.error("listFraternalEventsTimeline (fraternal_events) — échec requête de repli:", allErr);
    return { events: [], readFailed: true };
  }

  return { events: (allData ?? []) as FraternalEventRow[], readFailed: false };
}
