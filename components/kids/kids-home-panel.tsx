"use client";

import { Gamepad2, Home, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function KidsHomePanel() {
  const t = useTranslations("home.kids");

  return (
    <div className="space-y-8">
      <div className="space-y-6 rounded-[var(--radius)] border border-sky-200/90 bg-white/80 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button size="lg" type="button" asChild className="rounded-[var(--radius)] shadow-md">
            <Link href="/kids/jeux">
              <Gamepad2 className="size-5" aria-hidden />
              {t("gamesCta")}
            </Link>
          </Button>

          <Button size="lg" variant="secondary" type="button" asChild className="rounded-[var(--radius)] shadow-md">
            <Link href="/kids/histoires">
              <Sparkles className="size-5" aria-hidden />
              {t("storiesCta")}
            </Link>
          </Button>

          <Button variant="outline" size="lg" type="button" asChild className="rounded-[var(--radius)] border-sky-300 bg-white/90 text-slate-800 shadow-sm">
            <Link href="/">
              <Home className="size-5" aria-hidden />
              {t("backAdults")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
