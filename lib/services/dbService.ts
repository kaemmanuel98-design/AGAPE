import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Planning {
  id: string;
  service_date: string;
  service_name: string;
  regie: string | null;
  protocole: string | null;
  accueil: string | null;
  louange: string | null;
  predication: string | null;
  created_at: string;
}

export type LessonKind = "text" | "article" | "video" | "audio" | "livre";

export interface Lesson {
  id: string;
  level: string;
  module_title: string;
  title: string;
  content_kind: LessonKind;
  text_content: string | null;
  video_url: string | null;
  audio_url: string | null;
  author: string | null;
  cover_image: string | null;
  download_url: string | null;
  external_link: string | null;
  is_featured?: boolean | null;
  sort_order: number;
  created_at: string;
}

export interface Exhortation {
  id: string;
  exhortation_date: string;
  title: string;
  message: string | null;
  audio_url: string | null;
  created_at: string;
}

const PLANNING_SELECT =
  "id,service_date,service_name,regie,protocole,accueil,louange,predication,created_at";
const LESSON_SELECT =
  "id,level,module_title,title,content_kind,text_content,video_url,audio_url,author,cover_image,download_url,external_link,is_featured,sort_order,created_at";
const EXHORTATION_SELECT =
  "id,exhortation_date,title,message,audio_url,created_at";

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
}

export async function getLatestPlanning(
  referenceDate = new Date(),
): Promise<Planning | null> {
  try {
    const supabase = getSupabaseClient();
    const today = referenceDate.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("planning")
      .select(PLANNING_SELECT)
      .gte("service_date", today)
      .order("service_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as Planning;
    }

    const { data: fallback, error: fallbackError } = await supabase
      .from("planning")
      .select(PLANNING_SELECT)
      .lt("service_date", today)
      .order("service_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      throw fallbackError;
    }

    return (fallback as Planning | null) ?? null;
  } catch (error) {
    console.error("getLatestPlanning", error);
    return null;
  }
}

export async function getLessonsByLevel(level: string): Promise<Lesson[]> {
  try {
    const normalizedLevel = level.trim();

    if (!normalizedLevel) {
      return [];
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .select(LESSON_SELECT)
      .eq("level", normalizedLevel)
      .order("module_title", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as Lesson[];
  } catch (error) {
    console.error("getLessonsByLevel", error);
    return [];
  }
}

export async function getDailyExhortation(
  referenceDate = new Date(),
): Promise<Exhortation | null> {
  try {
    const supabase = getSupabaseClient();
    const today = referenceDate.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("daily_exhortations")
      .select(EXHORTATION_SELECT)
      .eq("exhortation_date", today)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as Exhortation;
    }

    const { data: fallback, error: fallbackError } = await supabase
      .from("daily_exhortations")
      .select(EXHORTATION_SELECT)
      .order("exhortation_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      throw fallbackError;
    }

    return (fallback as Exhortation | null) ?? null;
  } catch (error) {
    console.error("getDailyExhortation", error);
    return null;
  }
}
