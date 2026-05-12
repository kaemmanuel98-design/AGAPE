"use client";

import { Gamepad2, Home, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-sky-200/90 bg-gradient-to-r from-white/95 via-sky-50 to-yellow-50 px-5 py-4 shadow-[0_16px_40px_rgba(56,189,248,0.12)]">
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

      <div className="space-y-6 rounded-[40px] border border-white/70 bg-gradient-to-br from-white/96 via-sky-50/95 to-yellow-50/95 p-8 shadow-[0_22px_60px_rgba(56,189,248,0.16)] backdrop-blur-md">
        <div className="space-y-2">
          <div className="inline-flex h-10 max-w-full items-center rounded-full bg-sky-100 px-3 text-sky-700">
            <Logo
              variant="full"
              className="h-full"
              iconClassName="h-7"
              textClassName="text-xs font-semibold uppercase tracking-[0.18em]"
              label="Agapé Kids"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{t("title")}</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button size="lg" type="button" asChild className="rounded-[28px] bg-sky-600 shadow-[0_10px_30px_rgba(2,132,199,0.28)] hover:bg-sky-700">
            <Link href="/kids/jeux">
              <Gamepad2 className="size-6 shrink-0 sm:size-5" aria-hidden />
              <span className="text-lg font-semibold sm:text-base">{t("gamesCta")}</span>
            </Link>
          </Button>

          <Button size="lg" variant="secondary" type="button" asChild className="rounded-[28px] border border-yellow-200 bg-yellow-100 text-amber-900 shadow-[0_10px_26px_rgba(250,204,21,0.24)] hover:bg-yellow-200">
            <Link href="/kids/histoires">
              <Sparkles className="size-6 shrink-0 sm:size-5" aria-hidden />
              <span className="text-lg font-semibold sm:text-base">{t("storiesCta")}</span>
            </Link>
          </Button>

          <Button variant="outline" size="lg" type="button" asChild className="rounded-[28px] border-pink-200 bg-white/90 text-slate-800 shadow-sm hover:bg-pink-50">
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
