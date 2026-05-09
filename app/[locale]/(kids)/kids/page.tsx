import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function KidsHomePage() {
  const t = await getTranslations("home.kids");

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-primary/30 bg-gradient-to-br from-primary/15 via-card/60 to-card/40 p-8 shadow-lg backdrop-blur-md">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Button size="lg" type="button">
        {t("cta")}
      </Button>
    </div>
  );
}
