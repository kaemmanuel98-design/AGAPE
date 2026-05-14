import { getTranslations } from "next-intl/server";

import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";

export const dynamic = "force-dynamic";

/**
 * Page formulaire « Rejoindre la communauté » — connectée à l’action serveur `registerMember`.
 */
export default async function RejoindrePage() {
  const t = await getTranslations("memberRegistration");

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-6">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600/90">{t("brandTitle")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{t("title")}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
      </header>
      <MemberRegistrationForm />
    </div>
  );
}
