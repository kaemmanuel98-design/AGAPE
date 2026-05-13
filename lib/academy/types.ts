/**
 * Types pour l'Académie
 */
export type LessonKind = "text" | "video" | "audio";

export type LessonRow = {
  id: string;
  level: string; // Master : Obligatoire pour le tri
  module_title: string; // Master : Renommé pour plus de clarté
  title: string;
  content_kind: LessonKind; // Master : Typage strict pour l'UI
  text_content: string | null;
  video_url: string | null;
  audio_url: string | null;
  sort_order: number;
  created_at: string;
};

/**
 * Types pour le Planning (Branche academy-planning-admin)
 * Regroupe tous les rôles spécifiques pour un service
 */
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

/**
 * Types pour l'Exhortation Quotidienne
 */
export type DailyExhortationRow = {
  id: string;
  exhortation_date: string;
  message: string;
  audio_url: string | null;
  created_at: string;
};