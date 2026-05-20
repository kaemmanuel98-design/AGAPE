import { formatBirthdayMemberName, listTodayBirthdays } from "@/lib/calendar/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type BirthdayNotificationCopy = {
  title: string;
  body: string;
};

const COPY: Record<string, { title: (name: string) => string; body: (name: string) => string }> = {
  fr: {
    title: (name) => `Anniversaire de ${name}`,
    body: (name) =>
      `C'est l'anniversaire de ${name} aujourd'hui. Pensez à lui envoyer un mot d'encouragement sur le calendrier fraternel.`,
  },
  en: {
    title: (name) => `${name}'s birthday`,
    body: (name) =>
      `Today is ${name}'s birthday. Send a short blessing from the fraternal calendar.`,
  },
  nl: {
    title: (name) => `Verjaardag van ${name}`,
    body: (name) =>
      `Vandaag is het de verjaardag van ${name}. Stuur een bemoedigend bericht via de broederlijke kalender.`,
  },
};

function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveLocale(preferred?: string | null) {
  if (preferred && preferred in COPY) return preferred;
  return "fr";
}

export function birthdayNotificationCopy(
  memberName: string,
  locale: string,
): BirthdayNotificationCopy {
  const pack = COPY[resolveLocale(locale)] ?? COPY.fr;
  return { title: pack.title(memberName), body: pack.body(memberName) };
}

/**
 * Crée les notifications du jour pour un membre (anniversaires des autres).
 */
export async function syncBirthdayNotificationsForMember(
  recipientProfileId: string,
  preferredLanguage?: string | null,
) {
  const admin = createSupabaseServiceRoleClient();
  const today = todayIsoDate();

  const { data: recipient, error: recipientError } = await admin
    .from("profiles")
    .select("id, notify_birthdays, preferred_language")
    .eq("id", recipientProfileId)
    .maybeSingle();

  if (recipientError || !recipient?.notify_birthdays) {
    return { created: 0 };
  }

  const locale = preferredLanguage ?? recipient.preferred_language;
  const todayBirthdays = await listTodayBirthdays();
  const others = todayBirthdays.filter((p) => p.id !== recipientProfileId);

  let created = 0;
  for (const person of others) {
    const name = formatBirthdayMemberName(person);
    const { title, body } = birthdayNotificationCopy(name, resolveLocale(locale));

    const { error } = await admin.from("member_notifications").upsert(
      {
        recipient_profile_id: recipientProfileId,
        kind: "birthday_reminder",
        subject_profile_id: person.id,
        notification_date: today,
        title,
        body,
      },
      {
        onConflict: "recipient_profile_id,kind,subject_profile_id,notification_date",
        ignoreDuplicates: true,
      },
    );

    if (!error) created += 1;
  }

  return { created };
}

/** Synchronise les notifications pour tous les membres qui les acceptent. */
export async function syncAllBirthdayNotifications() {
  const admin = createSupabaseServiceRoleClient();
  const { data: members, error } = await admin
    .from("profiles")
    .select("id, preferred_language")
    .eq("notify_birthdays", true);

  if (error || !members?.length) {
    return { members: 0, notifications: 0 };
  }

  let notifications = 0;
  for (const member of members) {
    const result = await syncBirthdayNotificationsForMember(member.id, member.preferred_language);
    notifications += result.created;
  }

  return { members: members.length, notifications };
}
