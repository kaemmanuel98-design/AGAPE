import { getTranslations } from "next-intl/server";

import { SimplePlanningList } from "@/components/planning/simple-planning-list";
import { routing } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const panel =
  "rounded-[32px] border border-white/10 bg-slate-900/85 px-8 py-14 text-center text-slate-100 shadow-lg";

/**
 * Ici on vérifie la table `planning` puis on affiche la liste des cultes (ou un message d’attente).
 */
export default async function PlanningPage() {
  const t = await getTranslations("planning");
  const locale = routing.defaultLocale;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("planning").select("id").limit(1);

    if (error) {
      console.error("[AGAPE Planning] Requête de contrôle échouée :", error.message);
      return (
        <div className="min-h-[50vh]">
          <div className={panel}>
            <p className="text-lg font-semibold">{t("communityAppointmentsSoon")}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[50vh]">
        <SimplePlanningList locale={locale} />
      </div>
    );
  } catch (e) {
    console.error("[AGAPE Planning] Exception :", e);
    return (
      <div className="min-h-[50vh]">
        <div className={panel}>
          <p className="text-lg font-semibold">{t("communityAppointmentsSoon")}</p>
          <p className="mt-2 text-sm text-slate-400">Le contenu arrive bientôt…</p>
        </div>
      </div>
    );
  }
}
