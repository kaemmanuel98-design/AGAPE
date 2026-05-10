"use client";

import { Gamepad2, HeartHandshake, Home, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { clearKidsProfile } from "@/lib/actions/kids-session";
import { KIDS_AVATARS } from "@/lib/kids/avatars";
import type { KidProfile } from "@/lib/kids/types";

export function KidsHomePanel({ kidProfile }: { kidProfile: KidProfile | null }) {
  const t = useTranslations("home.kids");
  const locale = useLocale();

  const emoji = kidProfile
    ? (KIDS_AVATARS.find((a) => a.id === kidProfile.avatarId)?.emoji ?? "⭐")
    : null;

  return (
    <div className="space-y-8">
      {kidProfile ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius)] border border-sky-200 bg-gradient-to-r from-sky-50 to-white px-5 py-4 shadow-sm">
          <p className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            <span className="text-4xl leading-none" aria-hidden>
              {emoji}
            </span>
            <span>{t("kidHello", { name: kidProfile.firstName })}</span>
          </p>
          <form action={clearKidsProfile}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-[14px] border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-800 underline-offset-2 hover:bg-sky-50 hover:underline"
            >
              {t("kidSwitch")}
            </button>
          </form>
        </div>
      ) : null}

      <div className="space-y-6 rounded-[var(--radius)] border border-sky-200/90 bg-white/80 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t("title")}</h1>
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
            <Link href="/kids/login">
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
