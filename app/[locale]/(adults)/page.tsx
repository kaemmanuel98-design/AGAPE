import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function AdultsHomePage() {
  const t = await getTranslations("home.adults");

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Button variant="glass" size="lg" type="button">
        {t("cta")}
      </Button>
    </div>
  );
}
