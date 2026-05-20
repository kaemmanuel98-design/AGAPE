import NextLink from "next/link";
import { Cake, X } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  ensureBirthdayNotificationsForCurrentUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/member-notifications";
import { listUnreadMemberNotifications } from "@/lib/notifications/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function HubBirthdayNotifications() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  await ensureBirthdayNotificationsForCurrentUser();
  const notifications = await listUnreadMemberNotifications();
  if (!notifications.length) return null;

  const t = await getTranslations("notifications");

  return (
    <section
      className="mb-4 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm"
      aria-label={t("birthdayHeading")}
    >
      <p className="text-sm font-semibold">{t("birthdayHeading")}</p>
      <ul className="mt-3 space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            className="flex flex-col gap-2 rounded-xl border border-amber-200/70 bg-white/80 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex min-w-0 gap-2">
              <Cake className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-950">{n.title}</p>
                <p className="text-xs text-amber-900/80">{n.body}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <NextLink
                href="/calendar"
                className="inline-flex min-h-9 items-center rounded-full bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
              >
                {t("openCalendar")}
              </NextLink>
              <form
                action={async () => {
                  "use server";
                  await markNotificationRead(n.id);
                }}
              >
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
                >
                  <X className="size-3.5" aria-hidden />
                  {t("dismiss")}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {notifications.length > 1 ? (
        <form
          className="mt-3 text-center"
          action={async () => {
            "use server";
            await markAllNotificationsRead();
          }}
        >
          <button type="submit" className="text-xs font-medium text-amber-800 underline-offset-2 hover:underline">
            {t("dismissAll")}
          </button>
        </form>
      ) : null}
    </section>
  );
}
