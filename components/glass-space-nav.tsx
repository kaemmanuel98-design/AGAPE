"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Users } from "lucide-react";
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

  const shellClass =
    "flex items-center gap-3 rounded-[24px] border border-white/20 bg-white/10 px-4 py-3 shadow-[0_8px_32px_rgba(15,23,42,0.35)] backdrop-blur-xl backdrop-saturate-150";

  if (isAdmin) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav
          className={cn(shellClass, "mx-auto max-w-4xl justify-between")}
          aria-label="Admin navigation"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
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
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          {t("brand")}
        </Link>

        <div
          className="relative flex flex-1 justify-center sm:flex-none"
          role="tablist"
          aria-label={`${t("adults")} / ${t("kids")}`}
        >
          <div className="relative flex rounded-[24px] border border-white/15 bg-black/25 p-1 shadow-inner">
            <Link
              href="/"
              role="tab"
              aria-selected={!isKids}
              className={cn(
                "relative flex min-w-[8.5rem] items-center justify-center gap-2 rounded-[20px] px-5 py-2.5 text-sm font-medium transition-colors",
                !isKids ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
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
              <Users className="relative z-10 size-4 shrink-0" aria-hidden />
              <span className="relative z-10">{t("adults")}</span>
            </Link>

            <Link
              href="/kids"
              role="tab"
              aria-selected={isKids}
              className={cn(
                "relative flex min-w-[8.5rem] items-center justify-center gap-2 rounded-[20px] px-5 py-2.5 text-sm font-medium transition-colors",
                isKids ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
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
              <Sparkles className="relative z-10 size-4 shrink-0" aria-hidden />
              <span className="relative z-10">{t("kids")}</span>
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin"
            className="flex size-11 items-center justify-center rounded-[var(--radius)] border border-white/20 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
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
