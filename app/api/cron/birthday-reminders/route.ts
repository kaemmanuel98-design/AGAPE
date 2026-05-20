import { NextResponse } from "next/server";

import { syncAllBirthdayNotifications } from "@/lib/notifications/birthday-notifications";
import { sendBirthdayReminderEmails } from "@/lib/notifications/birthday-email";

export const dynamic = "force-dynamic";

/**
 * Cron quotidien (Vercel) : notifications in-app + e-mails de rappel anniversaire.
 * Protégé par `CRON_SECRET` ou `AGAPE_ALERT_API_SECRET`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim() || process.env.AGAPE_ALERT_API_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const querySecret = new URL(request.url).searchParams.get("secret")?.trim();

  if (!secret || (bearer !== secret && querySecret !== secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [notifications, emails] = await Promise.all([
    syncAllBirthdayNotifications(),
    sendBirthdayReminderEmails(),
  ]);

  return NextResponse.json({
    ok: true,
    notifications,
    emails,
  });
}
