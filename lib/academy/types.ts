export type LessonRow = {
  id: string;
  title: string;
  level: string | null;
  module: string | null;
  text_content: string | null;
  video_url: string | null;
  audio_url: string | null;
  sort_order: number | null;
  created_at: string;
};

export type PlanningRow = {
  id: string;
  service_date: string;
  service_name: string | null;
  regie: string | null;
  protocole: string | null;
  louange: string | null;
  predication: string | null;
  intercession: string | null;
  accueil: string | null;
  created_at: string;
};

export type DailyExhortationRow = {
  id: string;
  exhortation_date: string;
  message: string;
  audio_url: string | null;
  created_at: string;
};
