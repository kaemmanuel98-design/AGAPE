import { getTranslations } from "next-intl/server";

import { KidsSubpageShell } from "@/components/kids/kids-subpage-shell";

export default async function KidsHistoiresPage() {
  const t = await getTranslations("kidsPages.histoires");

  return (
    <KidsSubpageShell title={t("title")} subtitle={t("subtitle")} backHref="/kids">
      <p className="text-base leading-relaxed text-slate-700">{t("body")}</p>
    </KidsSubpageShell>
  );
}
