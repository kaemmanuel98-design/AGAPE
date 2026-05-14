import { Bell, CalendarHeart, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * Bandeau élégant lorsque la table `fraternal_events` est injoignable (migration non appliquée,
 * erreur réseau, etc.). Aucune authentification requise pour afficher ce message.
 */
export async function FraternalCalendarComingSoon() {
  const t = await getTranslations("calendar");

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-sky-950/80 p-8 sm:p-12">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#7CC6FF]/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-8 size-40 rounded-full bg-[#F4C95D]/10 blur-2xl" aria-hidden />

      <div className="relative mx-auto max-w-lg text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-[#7CC6FF] shadow-inner">
          <CalendarHeart className="size-8" aria-hidden />
        </div>
        <p className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4C95D]">
          <Sparkles className="size-3.5" aria-hidden />
          {t("fraternalComingSoonBadge")}
        </p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">{t("fraternalComingSoonTitle")}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">{t("fraternalComingSoonBody")}</p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Bell className="size-4 shrink-0 text-[#7CC6FF]" aria-hidden />
          <span>{t("fraternalComingSoonHint")}</span>
        </div>
      </div>
    </div>
  );
}
