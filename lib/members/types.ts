export type MemberRegistrationRow = {
  id: string;
  full_name: string | null;
  phone: string;
  city: string | null;
  situation: string | null;
  category: string | null;
  support_message: string | null;
  needs_urgent_help: boolean;
  created_at: string;
};
