"use client";

import NextLink from "next/link";
import { LayoutGroup, motion } from "framer-motion";
import { Calendar, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

import { NavAccountButton } from "./auth/nav-account-button";
import { LocaleSwitcher } from "./locale-switcher";

const pillTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
};

export function GlassSpaceNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isKids = pathname === "/kids" || pathname.startsWith("/kids/");
  const isAdmin =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isCalendar =
    pathname === "/calendar" || pathname.startsWith("/calendar/");
  const isAdminPortal =
    pathname.includes("admin-portal-agape") ||
    pathname.includes("admin-secret-dashboard") ||
    pathname.includes("management-agape-secret");

  /* Avant : grille 2 colonnes + zone actions à droite → le CTA « Rejoindre » entrait en collision avec calendrier / langue sur mobile.
     Ici : flex-col + gap-2 sur mobile pour empiler proprement ; sm:flex-row + flex-wrap pour les écrans moyens si besoin. */
  const shellClass = cn(
    "mx-auto flex max-w-4xl flex-col gap-2 rounded-[24px] px-3 py-3 backdrop-blur-xl backdrop-saturate-150 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4",
    isKids
      ? "border border-sky-300/50 bg-white/45 text-slate-900 shadow-[0_10px_36px_rgba(15,23,42,0.12)]"
      : "border border-white/20 bg-white/10 text-foreground shadow-[0_8px_32px_rgba(15,23,42,0.35)]",
  );

  if (isAdminPortal) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav
          className="mx-auto flex max-w-4xl items-center justify-between rounded-[24px] border border-slate-200/90 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-4"
          aria-label={t("brand")}
        >
          <Link
            href="/"
            className="flex min-w-0 max-w-[11rem] items-center overflow-hidden text-lg font-semibold tracking-tight text-slate-900 sm:max-w-none"
          >
            <Logo
              variant="full"
              label={t("brand")}
              className="h-8 max-w-full sm:h-9"
              iconClassName="h-full"
              textClassName="text-[0.95rem] font-semibold uppercase tracking-[0.12em] sm:text-base"
            />
          </Link>
          <LocaleSwitcher />
        </nav>
      </header>
    );
  }

  if (isAdmin) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav
          className={cn(
            "mx-auto flex max-w-4xl items-center justify-between rounded-[24px] px-3 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-4",
            isKids
              ? "border border-sky-300/50 bg-white/45 text-slate-900 shadow-[0_10px_36px_rgba(15,23,42,0.12)]"
              : "border border-white/20 bg-white/10 text-foreground shadow-[0_8px_32px_rgba(15,23,42,0.35)]",
          )}
          aria-label="Admin navigation"
        >
          <Link
            href="/"
            className="flex min-w-0 max-w-[11rem] items-center overflow-hidden text-lg font-semibold tracking-tight sm:max-w-none"
          >
            <Logo
              variant="full"
              label={t("brand")}
              className="h-8 max-w-full sm:h-9"
              iconClassName="h-full"
              textClassName="text-[0.95rem] font-semibold uppercase tracking-[0.12em] sm:text-base"
            />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className={shellClass} aria-label={t("brand")}>
        {/* Ligne 1 (mobile + desktop) : marque AGAPE + onglets — flex-wrap évite que les onglets poussent hors du cadre */}
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-2 sm:flex-1 sm:justify-start sm:gap-3">
          <Link
            href="/"
            className={cn(
              "relative z-10 flex min-w-0 max-w-[11rem] shrink-0 items-center overflow-hidden text-lg font-semibold tracking-tight sm:max-w-none",
              isKids ? "text-slate-900" : "text-foreground",
            )}
          >
            <Logo
              variant="full"
              label={t("brand")}
              className="h-8 max-w-full sm:h-9"
              iconClassName="h-full"
              textClassName="text-[0.95rem] font-semibold uppercase tracking-[0.12em] sm:text-base"
            />
          </Link>

          <LayoutGroup id="space-tabs">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="relative z-10 flex min-w-0 flex-1 justify-center sm:justify-center"
              role="tablist"
              aria-label={`${t("adults")} / ${t("kids")}`}
            >
              <motion.div
                layout
                className={cn(
                  "relative flex w-full max-w-[22rem] rounded-[24px] p-1 shadow-inner sm:w-auto sm:max-w-none",
                  isKids
                    ? "border border-sky-300/45 bg-white/55"
                    : "border border-white/15 bg-black/25",
                )}
              >
              <Link
                href="/"
                role="tab"
                aria-selected={!isKids}
                className={cn(
                  "relative flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[20px] px-3 py-2.5 text-sm font-medium transition-colors sm:min-w-[8.5rem] sm:px-5",
                  !isKids
                    ? "text-primary-foreground"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {!isKids ? (
                  <motion.span
                    layoutId="space-pill"
                    className="absolute inset-0 rounded-[20px] bg-primary shadow-md"
                    transition={pillTransition}
                    aria-hidden
                  />
                ) : null}
                <motion.span
                  animate={{ rotate: !isKids ? [0, -6, 0] : 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 inline-flex items-center gap-2"
                >
                  <Users className="size-4 shrink-0" aria-hidden />
                  <span>{t("adults")}</span>
                </motion.span>
              </Link>

              <Link
                href="/kids"
                role="tab"
                aria-selected={isKids}
                className={cn(
                  "relative flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[20px] px-3 py-2.5 text-sm font-medium transition-colors sm:min-w-[8.5rem] sm:px-5",
                  isKids
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isKids ? (
                  <motion.span
                    layoutId="space-pill"
                    className="absolute inset-0 rounded-[20px] bg-primary shadow-md"
                    transition={pillTransition}
                    aria-hidden
                  />
                ) : null}
                <motion.span
                  animate={{ rotate: isKids ? [0, 10, 0] : 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 inline-flex items-center gap-2"
                >
                  <Sparkles className="size-4 shrink-0" aria-hidden />
                  <span>{t("kids")}</span>
                </motion.span>
              </Link>
              </motion.div>
            </motion.div>
          </LayoutGroup>
        </div>

        {/* Ligne 2–3 sur mobile : CTA pleine largeur, puis calendrier + langue (gap-2) — plus de chevauchement avec le logo / onglets */}
        <div className="relative z-10 flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
          <NavAccountButton variantKids={isKids} className="justify-center" />
          <div className="flex items-center justify-end gap-2 sm:justify-start">
            <NextLink
              href="/calendar"
              prefetch
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] transition-colors",
                isKids
                  ? "border border-sky-300/55 bg-white/60 text-slate-700 hover:bg-white/85"
                  : "border border-white/20 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
                isCalendar && "ring-2 ring-primary ring-offset-2 ring-offset-transparent",
              )}
              aria-label={t("calendar")}
              title={t("calendar")}
            >
              <Calendar className="size-5" aria-hidden />
            </NextLink>
            <LocaleSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
