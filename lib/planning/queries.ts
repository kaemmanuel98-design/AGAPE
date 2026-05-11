import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { PlanningRow } from "./types";

const PLANNING_SELECT =
  "id,service_date,service_name,regie,protocole,accueil,louange,predication,created_at";

export async function listPlanning(): Promise<PlanningRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("planning")
    .select(PLANNING_SELECT)
    .order("service_date", { ascending: true });

  if (error) {
    console.error("listPlanning", error);
    return [];
  }

  return (data ?? []) as PlanningRow[];
}

export async function listPlanningForCurrentMonth(): Promise<PlanningRow[]> {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("planning")
    .select(PLANNING_SELECT)
    .gte("service_date", start.toISOString().slice(0, 10))
    .lt("service_date", end.toISOString().slice(0, 10))
    .order("service_date", { ascending: true });

  if (error) {
    console.error("listPlanningForCurrentMonth", error);
    return [];
  }

  return (data ?? []) as PlanningRow[];
}
