import { MonthCalendar } from "@/components/calendar/month-calendar";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const panel =
  "rounded-[32px] border border-white/10 bg-slate-900/85 px-8 py-14 text-center text-slate-100 shadow-lg";

/**
 * Ici on vérifie que Supabase répond avant d’afficher le calendrier complet (anniversaires + événements).
 */
export default async function CalendarPage() {
  const t = await getTranslations("calendar");

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("fraternal_events").select("id").limit(1);

    if (error) {
      console.error("[AGAPE Calendrier] Requête de contrôle échouée :", error.message);
      return (
        <div className="min-h-[50vh] space-y-6">
          <div className={panel}>
            <p className="text-lg font-semibold">{t("communityAppointmentsSoon")}</p>
            <p className="mt-3 text-sm text-slate-400">{t("timelineEmpty")}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[50vh]">
        <MonthCalendar />
      </div>
    );
  } catch (e) {
    console.error("[AGAPE Calendrier] Exception :", e);
    return (
      <div className="min-h-[50vh]">
        <div className={panel}>
          <p className="text-lg font-semibold">{t("loadErrorTitle")}</p>
          <p className="mt-2 text-sm text-slate-400">{t("loadErrorHint")}</p>
        </div>
      </div>
    );
  }
}
