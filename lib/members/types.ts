export type MemberRegistrationRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string;
  city: string | null;
  preferred_language: string | null;
  talents: unknown;
  accompaniment_need: string | null;
  situation: string | null;
  category: string | null;
  support_message: string | null;
  needs_urgent_help: boolean;
  is_priority: boolean;
  is_priority_emergency: boolean;
  /** Lien vers `auth.users` / `profiles` après inscription parcours /rejoindre. */
  auth_user_id: string | null;
  /** URL publique Storage (`avatars`), voir commentaire dans `lib/actions/upload-registration-avatar.ts`. */
  avatar_url: string | null;
  archived: boolean;
  admin_notes: string | null;
  created_at: string;
};
