"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { saveKidsProfile } from "@/lib/actions/kids-session";
import { KIDS_AVATARS, type KidsAvatarId } from "@/lib/kids/avatars";
import { cn } from "@/lib/utils";

export function KidsSimpleLoginForm({ locale }: { locale: string }) {
  const t = useTranslations("kidsLogin");
  const [avatarId, setAvatarId] = useState<KidsAvatarId>(KIDS_AVATARS[0].id);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 pb-8">
      <div className="flex justify-start">
        <Button variant="ghost" size="sm" asChild className="gap-2 rounded-[14px] text-slate-700 hover:bg-white/80">
          <Link href="/kids">
            <ArrowLeft className="size-4" aria-hidden />
            {t("back")}
          </Link>
        </Button>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t("title")}</h1>
        <p className="text-lg leading-relaxed text-slate-600">{t("subtitle")}</p>
      </div>

      <form action={saveKidsProfile} className="space-y-8 rounded-[var(--radius)] border border-sky-200/90 bg-white/95 p-7 shadow-[0_20px_50px_rgba(14,165,233,0.12)] sm:p-9">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="avatarId" value={avatarId} />

        <div className="space-y-3">
          <p className="text-center text-base font-semibold text-slate-800">{t("pickAvatar")}</p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
            {KIDS_AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={cn(
                  "flex aspect-square items-center justify-center rounded-[18px] border-2 text-4xl transition-all sm:text-5xl",
                  avatarId === a.id
                    ? "scale-[1.03] border-sky-500 bg-sky-50 shadow-md ring-2 ring-sky-400/60"
                    : "border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50/80",
                )}
                aria-pressed={avatarId === a.id}
                aria-label={t(`avatar.${a.id}`)}
                onClick={() => setAvatarId(a.id)}
              >
                <span aria-hidden>{a.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="kids-first-name" className="block text-center text-base font-semibold text-slate-800">
            {t("firstName")}
          </label>
          <input
            id="kids-first-name"
            name="firstName"
            type="text"
            autoComplete="nickname"
            required
            minLength={2}
            maxLength={40}
            placeholder={t("firstNamePlaceholder")}
            className="h-14 w-full rounded-[16px] border border-sky-200 bg-white px-4 text-center text-xl font-medium text-slate-900 outline-none ring-sky-400 focus:ring-2"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-14 w-full rounded-[18px] bg-gradient-to-r from-sky-500 to-sky-600 text-lg font-bold text-white shadow-lg hover:from-sky-600 hover:to-sky-700"
        >
          {t("submit")}
        </Button>

        <p className="text-center text-xs leading-relaxed text-slate-500">{t("finePrint")}</p>
      </form>
    </div>
  );
}
