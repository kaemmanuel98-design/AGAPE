export type PrayerRequestRow = {
  id: string;
  sender_name: string | null;
  message: string;
  is_anonymous: boolean;
  requester_user_id: string | null;
  category: "urgence_vitale" | "maladie" | "deuil" | "accompagnement" | null;
  phone_contact: string | null;
  assistance_type: "urgence_vitale" | "maladie" | "deuil" | "accompagnement" | null;
  contact: string | null;
  assistance_status: "en_attente" | "en_cours" | "accompagne";
  internal_notes: string | null;
  source: string;
  created_at: string;
};

export type AdminAssistanceRequestRow = PrayerRequestRow & {
  requester_profile: {
    first_names: string | null;
    last_name: string | null;
  } | null;
};
