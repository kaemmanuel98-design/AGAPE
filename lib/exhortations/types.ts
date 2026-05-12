export type DailyExhortationRow = {
  id: string;
  exhortation_date: string;
  title: string;
  message: string | null;
  audio_url: string | null;
  created_at: string;
};
