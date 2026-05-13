export type FraternalEventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  meeting_url: string | null;
  registration_url: string | null;
  created_at: string;
};
