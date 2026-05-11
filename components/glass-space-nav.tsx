"use client";

import { LayoutGroup, motion } from "framer-motion";
import { Calendar, Shield, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

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

  const shellClass = cn(
    "flex items-center gap-3 rounded-[24px] px-4 py-3 backdrop-blur-xl backdrop-saturate-150",
    isKids
      ? "border border-sky-300/50 bg-white/45 text-slate-900 shadow-[0_10px_36px_rgba(15,23,42,0.12)]"
      : "border border-white/20 bg-white/10 text-foreground shadow-[0_8px_32px_rgba(15,23,42,0.35)]",
  );

  if (isAdmin) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav
          className={cn(shellClass, "mx-auto max-w-4xl justify-between")}
          aria-label="Admin navigation"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            {t("brand")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={cn(
          shellClass,
          "mx-auto max-w-4xl flex-wrap justify-between gap-y-3 sm:flex-nowrap",
        )}
        aria-label={t("brand")}
      >
        <Link
          href="/"
          className={cn(
            "relative z-10 flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight",
            isKids ? "text-slate-900" : "text-foreground",
          )}
        >
          {t("brand")}
        </Link>

        <LayoutGroup id="space-tabs">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="relative z-10 flex flex-1 justify-center sm:flex-none"
            role="tablist"
            aria-label={`${t("adults")} / ${t("kids")}`}
          >
            <motion.div
              layout
              className={cn(
                "relative flex rounded-[24px] p-1 shadow-inner",
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
                  "relative flex min-h-[44px] min-w-[8.5rem] items-center justify-center gap-2 rounded-[20px] px-5 py-2.5 text-sm font-medium transition-colors",
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
                  "relative flex min-h-[44px] min-w-[8.5rem] items-center justify-center gap-2 rounded-[20px] px-5 py-2.5 text-sm font-medium transition-colors",
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

        <div className="relative z-10 flex shrink-0 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
          <Link
            href="/calendar"
            prefetch
            className={cn(
              "flex size-11 items-center justify-center rounded-[var(--radius)] transition-colors",
              isKids
                ? "border border-sky-300/55 bg-white/60 text-slate-700 hover:bg-white/85"
                : "border border-white/20 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
              isCalendar && "ring-2 ring-primary ring-offset-2 ring-offset-transparent",
            )}
            aria-label={t("calendar")}
            title={t("calendar")}
          >
            <Calendar className="size-5" aria-hidden />
          </Link>
          <Link
            href="/admin"
            prefetch
            className={cn(
              "flex size-11 items-center justify-center rounded-[var(--radius)] transition-colors",
              isKids
                ? "border border-sky-300/55 bg-white/60 text-slate-700 hover:bg-white/85"
                : "border border-white/20 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
            )}
            aria-label={t("admin")}
            title={t("admin")}
          >
            <Shield className="size-5" aria-hidden />
          </Link>
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}
