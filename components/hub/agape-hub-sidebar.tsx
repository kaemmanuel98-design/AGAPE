"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, GraduationCap, Home, LayoutList, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { NavAccountButton } from "@/components/auth/nav-account-button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/ui/Logo";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  labelKey: "navHome" | "navBible" | "navAcademy" | "navCalendar" | "navPlanning" | "navJoin";
  icon: typeof Home;
  match: (path: string) => boolean;
};

const items: NavItem[] = [
  {
    href: `/${routing.defaultLocale}`,
    labelKey: "navHome",
    icon: Home,
    match: (p) => p === `/${routing.defaultLocale}` || p === "/" || /^\/(fr|en|nl)\/?$/.test(p),
  },
  {
    href: "/bible-strong",
    labelKey: "navBible",
    icon: BookOpen,
    match: (p) => p === "/bible-strong" || p.startsWith("/bible-strong/"),
  },
  {
    href: "/academy",
    labelKey: "navAcademy",
    icon: GraduationCap,
    match: (p) => p === "/academy" || p.startsWith("/academy/"),
  },
  {
    href: "/calendar",
    labelKey: "navCalendar",
    icon: CalendarDays,
    match: (p) => p === "/calendar" || p.startsWith("/calendar/"),
  },
  {
    href: "/planning",
    labelKey: "navPlanning",
    icon: LayoutList,
    match: (p) => p === "/planning" || p.startsWith("/planning/"),
  },
  {
    href: "/join",
    labelKey: "navJoin",
    icon: UserPlus,
    match: (p) => p === "/join" || p.startsWith("/join/") || p.includes("rejoindre"),
  },
];

/**
 * Barre latérale fixe : navigation principale entre les piliers (Accueil, Bible, Academy, etc.).
 */
export function AgapeHubSidebar() {
  const t = useTranslations("hub");
  const pathname = usePathname() ?? "";

  return (
    <aside
      className={cn(
        "flex w-full flex-col border-b border-slate-200/90 bg-white/95 shadow-sm md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r md:px-3 md:py-6",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-3 md:flex-col md:items-stretch md:px-2 md:py-0">
        <NextLink
          href={`/${routing.defaultLocale}`}
          className="flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 text-slate-900"
        >
          <Logo variant="icon" label="AGAPE" className="h-9 w-9 shrink-0" iconClassName="h-full" textClassName="sr-only" />
          <span className="truncate text-sm font-semibold tracking-tight md:hidden">AGAPE</span>
        </NextLink>
        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
        </div>
      </div>

      <nav className="flex flex-row gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-2 md:pb-0" aria-label={t("ariaLabel")}>
        {items.map(({ href, labelKey, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <NextLink
              key={href + labelKey}
              href={href}
              prefetch
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:py-2.5",
                active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              <span className="whitespace-nowrap">{t(labelKey)}</span>
            </NextLink>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-3 border-t border-slate-100 p-3 md:flex">
        <LocaleSwitcher />
        <NavAccountButton variantKids={false} className="justify-start" />
      </div>
    </aside>
  );
}
