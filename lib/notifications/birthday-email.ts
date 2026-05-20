import { formatBirthdayMemberName, listTodayBirthdays } from "@/lib/calendar/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const RESEND_API_URL = "https://api.resend.com/emails";

const SUBJECT: Record<string, string> = {
  fr: "Anniversaires AGAPE aujourd'hui",
  en: "AGAPE birthdays today",
  nl: "AGAPE-verjaardagen vandaag",
};

function resolveLocale(preferred?: string | null) {
  if (preferred && preferred in SUBJECT) return preferred;
  return "fr";
}

function buildHtml(names: string[], locale: string, siteUrl: string) {
  const list = names.map((n) => `<li><strong>${n}</strong></li>`).join("");
  if (locale === "en") {
    return `<p>Hello,</p><p>Today we celebrate:</p><ul>${list}</ul><p><a href="${siteUrl}/calendar">Open the fraternal calendar</a> to send a message.</p><p>— AGAPE team</p>`;
  }
  if (locale === "nl") {
    return `<p>Hallo,</p><p>Vandaag vieren we:</p><ul>${list}</ul><p><a href="${siteUrl}/calendar">Open de broederlijke kalender</a> om een bericht te sturen.</p><p>— AGAPE-team</p>`;
  }
  return `<p>Bonjour,</p><p>Aujourd'hui nous fêtons :</p><ul>${list}</ul><p><a href="${siteUrl}/calendar">Ouvrir le calendrier fraternel</a> pour envoyer un message.</p><p>— Équipe AGAPE</p>`;
}

/** Envoie un e-mail de rappel aux membres qui ont une adresse e-mail et acceptent les notifications. */
export async function sendBirthdayReminderEmails() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.AGAPE_ALERT_FROM?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://agape-kappa.vercel.app";

  if (!apiKey || !from) {
    return { sent: 0, skipped: "resend_not_configured" as const };
  }

  const todayBirthdays = await listTodayBirthdays();
  if (!todayBirthdays.length) {
    return { sent: 0, skipped: "no_birthdays_today" as const };
  }

  const names = todayBirthdays.map((p) => formatBirthdayMemberName(p));
  const admin = createSupabaseServiceRoleClient();
  const { data: recipients, error } = await admin
    .from("profiles")
    .select("id, email, preferred_language, notify_birthdays")
    .eq("notify_birthdays", true)
    .not("email", "is", null);

  if (error || !recipients?.length) {
    return { sent: 0, skipped: "no_recipients" as const };
  }

  let sent = 0;
  for (const recipient of recipients) {
    const email = recipient.email?.trim();
    if (!email) continue;

    const others = names.filter((_, i) => todayBirthdays[i]?.id !== recipient.id);
    if (!others.length) continue;

    const locale = resolveLocale(recipient.preferred_language);
    const subject = SUBJECT[locale];
    const html = buildHtml(others, locale, siteUrl);

    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [email], subject, html }),
    });

    if (res.ok) sent += 1;
    else {
      const detail = await res.text().catch(() => "");
      console.error("[AGAPE birthday email]", email, res.status, detail.slice(0, 200));
    }
  }

  return { sent };
}
