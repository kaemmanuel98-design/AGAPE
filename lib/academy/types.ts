export type LessonKind = "text" | "article" | "video" | "audio" | "livre";

export type LessonRow = {
  id: string;
  level: string;
  module_title: string;
  title: string;
  content_kind: LessonKind;
  text_content: string | null;
  video_url: string | null;
  audio_url: string | null;
  /** Pour `content_kind === "livre"` : nom affiché sous le titre (saisi dans l’admin). */
  author: string | null;
  /** URL HTTPS de l’image de couverture (ex. fichier sur Supabase Storage ou CDN public). */
  cover_image: string | null;
  /** Lien direct vers le fichier PDF à proposer au téléchargement. */
  download_url: string | null;
  /** Lien vers une version en ligne (liseuse, boutique, site éditeur, etc.). */
  external_link: string | null;
  sort_order: number;
  created_at: string;
  /** Si vrai, la carte est mise en avant en tête de l’Academy (`AcademyFeatured`). */
  is_featured?: boolean | null;
};
