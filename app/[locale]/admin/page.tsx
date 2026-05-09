import { getTranslations } from "next-intl/server";

import { AdminResourcesForm } from "@/components/admin/admin-resources-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function AdminHomePage() {
  const t = await getTranslations("admin");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--radius)] border border-border bg-card/60 p-8 backdrop-blur-md">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" asChild className="rounded-[var(--radius)]">
            <Link href="/">{t("backHome")}</Link>
          </Button>
          <Button type="button" variant="secondary" asChild className="rounded-[var(--radius)]">
            <Link href="/calendar">{t("openCalendar")}</Link>
          </Button>
        </div>
      </div>

      <AdminResourcesForm />
    </div>
  );
}
