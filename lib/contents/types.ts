export type ContentCategory = "adult" | "child";
export type ContentType = "video" | "pdf";

export type ContentRow = {
  id: string;
  title: string;
  content_type: ContentType;
  content_url: string;
  category: ContentCategory;
  created_at: string;
};
