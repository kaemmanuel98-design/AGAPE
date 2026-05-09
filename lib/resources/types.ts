export type ResourceRow = {
  id: string;
  title: string;
  resource_type: "youtube" | "pdf";
  youtube_url: string | null;
  pdf_url: string | null;
  pdf_filename: string | null;
  created_at: string;
};
