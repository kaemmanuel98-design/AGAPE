import type { PlanningRow } from "./types";
import { createClient } from "@/utils/supabase/server";

const PLANNING_SELECT =
  "id,service_date,service_name,regie,protocole,accueil,louange,predication,created_at";

/**
 * Tous les cultes / services planifiés.
 *
 * --- Appel SQL ---
 * `SELECT` colonnes service sur `public.planning`
 * `ORDER BY service_date ASC`
 * → ordre chronologique des créneaux (lecture publique anon/authenticated selon RLS).
 */
export async function listPlanning(): Promise<PlanningRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planning")
    .select(PLANNING_SELECT)
    .order("service_date", { ascending: true });

  if (error) {
    console.error("listPlanning (planning)", error);
    return [];
  }

  return (data ?? []) as PlanningRow[];
}

/**
 * Cultes du mois civil courant.
 *
 * --- Appel SQL ---
 * `SELECT` mêmes colonnes sur `public.planning`
 * `WHERE service_date >= premier_jour_du_mois AND service_date < premier_jour_du_mois_suivant`
 * (bornes au format date ISO `YYYY-MM-DD`)
 * `ORDER BY service_date ASC`.
 */
export async function listPlanningForCurrentMonth(): Promise<PlanningRow[]> {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planning")
    .select(PLANNING_SELECT)
    .gte("service_date", start.toISOString().slice(0, 10))
    .lt("service_date", end.toISOString().slice(0, 10))
    .order("service_date", { ascending: true });

  if (error) {
    console.error("listPlanningForCurrentMonth (planning)", error);
    return [];
  }

  return (data ?? []) as PlanningRow[];
}

/**
 * Créneaux visibles pour les membres : services à partir d’aujourd’hui.
 *
 * --- Appel SQL principal ---
 * `SELECT` postes de service sur `public.planning`
 * `WHERE service_date >= :aujourd’hui` (date locale du serveur, tronquée en `YYYY-MM-DD`)
 * `ORDER BY service_date ASC` puis `LIMIT 80`.
 *
 * Si aucune ligne future n’est retournée, on enchaîne sur `listPlanning()` (sans filtre de date)
 * pour afficher au moins les derniers cultes saisis en base (phase de mise en route).
 */
export async function listPlanningForMembers(): Promise<PlanningRow[]> {
  const todayIso = new Date().toISOString().slice(0, 10);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planning")
    .select(PLANNING_SELECT)
    .gte("service_date", todayIso)
    .order("service_date", { ascending: true })
    .limit(80);

  if (error) {
    console.error("listPlanningForMembers (planning)", error);
    return [];
  }

  const rows = (data ?? []) as PlanningRow[];
  if (rows.length > 0) return rows;
  return listPlanning();
}
