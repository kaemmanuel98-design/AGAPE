"use client";

import { Gamepad2, HeartHandshake, Home, Sparkles } from "lucide-react";
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
              <Gamepad2 className="size-6 shrink-0 sm:size-5" aria-hidden />
              <span className="text-lg font-semibold sm:text-base">{t("gamesCta")}</span>
            </Link>
          </Button>

          <Button size="lg" variant="secondary" type="button" asChild className="rounded-[var(--radius)] shadow-md">
            <Link href="/kids/histoires">
              <Sparkles className="size-6 shrink-0 sm:size-5" aria-hidden />
              <span className="text-lg font-semibold sm:text-base">{t("storiesCta")}</span>
            </Link>
          </Button>

          <Button
            size="lg"
            type="button"
            asChild
            className="rounded-[var(--radius)] border-2 border-sky-500/80 bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-[0_12px_36px_rgba(2,132,199,0.35)] hover:from-sky-600 hover:to-sky-700 [&_svg]:size-6 sm:[&_svg]:size-5"
          >
            <Link href="/login?kids=1">
              <HeartHandshake aria-hidden />
              <span className="text-lg font-semibold sm:text-base">{t("loginWithParent")}</span>
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
