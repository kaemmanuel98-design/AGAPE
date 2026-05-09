import { getTranslations } from "next-intl/server";

import { KidsSubpageShell } from "@/components/kids/kids-subpage-shell";

export default async function KidsJeuxPage() {
  const t = await getTranslations("kidsPages.jeux");

  return (
    <KidsSubpageShell title={t("title")} subtitle={t("subtitle")} backHref="/kids">
      <p className="text-base leading-relaxed text-slate-700">{t("body")}</p>
    </KidsSubpageShell>
  );
}
