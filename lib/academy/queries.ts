import { endOfMonth, format, startOfMonth } from "date-fns";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { DailyExhortationRow, LessonRow, PlanningRow } from "./types";

export async function listLessons(): Promise<LessonRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id,title,level,module,text_content,video_url,audio_url,sort_order,created_at")
    .order("level", { ascending: true, nullsFirst: false })
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listLessons", error);
    return [];
  }

  return (data ?? []) as LessonRow[];
}

export async function listPlanningForMonth(reference = new Date()): Promise<PlanningRow[]> {
  const supabase = await createSupabaseServerClient();
  const monthStart = format(startOfMonth(reference), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(reference), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("planning")
    .select(
      "id,service_date,service_name,regie,protocole,louange,predication,intercession,accueil,created_at",
    )
    .gte("service_date", monthStart)
    .lte("service_date", monthEnd)
    .order("service_date", { ascending: true });

  if (error) {
    console.error("listPlanningForMonth", error);
    return [];
  }

  return (data ?? []) as PlanningRow[];
}

export async function listAllPlanning(): Promise<PlanningRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("planning")
    .select(
      "id,service_date,service_name,regie,protocole,louange,predication,intercession,accueil,created_at",
    )
    .order("service_date", { ascending: true });

  if (error) {
    console.error("listAllPlanning", error);
    return [];
  }

  return (data ?? []) as PlanningRow[];
}

export async function listDailyExhortations(): Promise<DailyExhortationRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("daily_exhortations")
    .select("id,exhortation_date,message,audio_url,created_at")
    .order("exhortation_date", { ascending: false })
    .limit(30);

  if (error) {
    console.error("listDailyExhortations", error);
    return [];
  }

  return (data ?? []) as DailyExhortationRow[];
}
