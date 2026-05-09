import { getTranslations } from "next-intl/server";

export default async function AdminHomePage() {
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-border bg-card/60 p-8 backdrop-blur-md">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("subtitle")}</p>
    </div>
  );
}
