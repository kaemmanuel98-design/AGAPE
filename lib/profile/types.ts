export type MemberProfileRow = {
  id: string;
  role: string;
  first_names: string | null;
  last_name: string | null;
  birth_date: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  updated_at: string;
};

export type ChildProfileRow = {
  id: string;
  parent_id: string;
  first_names: string;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
