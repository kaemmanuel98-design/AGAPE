export type LessonKind = "text" | "video" | "audio";

export type LessonRow = {
  id: string;
  level: string;
  module_title: string;
  title: string;
  content_kind: LessonKind;
  text_content: string | null;
  video_url: string | null;
  audio_url: string | null;
  sort_order: number;
  created_at: string;
};
