import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function KidsHomePage() {
  const t = await getTranslations("home.kids");

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-sky-200/90 bg-white/80 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-slate-600">{t("subtitle")}</p>
      </div>
      <Button size="lg" type="button" className="rounded-[var(--radius)] shadow-md">
        {t("cta")}
      </Button>
    </div>
  );
}
