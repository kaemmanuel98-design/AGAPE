"use client";

import NextLink from "next/link";
import { motion } from "framer-motion";
import { BookOpen, BookOpenText, CalendarDays, ChevronDown, Newspaper } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

type NewsItem = { title: string; date: string; body: string };

export function AdultsHomeHero() {
  const t = useTranslations("home.adults");

  return (
    <div className="agape-brand-surface mt-4 space-y-6 scroll-mt-32 rounded-[var(--radius)] p-8 text-white sm:mt-3">
      {/* mt-4 / scroll-mt : marge sous le header fixe pour que le titre « Espace adultes » ne colle pas à la barre AGAPE */}
      <div className="space-y-2">
        <div className="agape-brand-badge h-10 max-w-full px-3">
          <Logo
            variant="full"
            className="h-full"
            iconClassName="h-7"
            textClassName="text-sm font-semibold tracking-[0.12em] text-slate-100"
            label="AGAPE"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-slate-300">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button size="lg" type="button" variant="brand" asChild className="rounded-[var(--radius)]">
          <a href="#decouvrir-contenus">
            <ChevronDown className="size-5 opacity-90" aria-hidden />
            {t("ctaResources")}
          </a>
        </Button>

        <Button variant="secondary" size="lg" type="button" asChild className="rounded-[var(--radius)] border border-white/10 bg-white/10 text-slate-50 hover:bg-white/15">
          <NextLink href="/academy">
            <BookOpenText className="size-5" aria-hidden />
            {t("academyLink")}
          </NextLink>
        </Button>

        <Button variant="secondary" size="lg" type="button" asChild className="rounded-[var(--radius)] border border-white/10 bg-white/10 text-slate-50 hover:bg-white/15">
          <NextLink href="/calendar">
            <CalendarDays className="size-5" aria-hidden />
            {t("calendarLink")}
          </NextLink>
        </Button>

        <Button variant="outline" size="lg" type="button" asChild className="rounded-[var(--radius)] border-white/14 bg-white/5 text-slate-100 hover:bg-white/10">
          <NextLink href="/planning">
            <CalendarDays className="size-5" aria-hidden />
            {t("planningLink")}
          </NextLink>
        </Button>

        <Button variant="outline" size="lg" type="button" asChild className="rounded-[var(--radius)] border-white/14 bg-white/5 text-slate-100 hover:bg-white/10">
          <NextLink href="/bible-strong">
            <BookOpen className="size-5" aria-hidden />
            {t("strongCtaShort")}
          </NextLink>
        </Button>
      </div>
    </div>
  );
}

export function AdultsNewsSection() {
  const t = useTranslations("home.adults");
  const newsItems = t.raw("newsItems") as NewsItem[];

  return (
    <motion.section
      id="actualites-eglise"
      initial={false}
      animate={{ opacity: 1 }}
      className="agape-brand-surface scroll-mt-28 space-y-5 rounded-[var(--radius)] p-8"
      aria-labelledby="news-heading"
    >
      <div className="flex items-center gap-2 text-slate-50">
        <Newspaper className="size-7 text-[#7CC6FF]" aria-hidden />
        <h2 id="news-heading" className="text-xl font-semibold tracking-tight md:text-2xl">
          {t("newsTitle")}
        </h2>
      </div>

      <ul className="space-y-4">
        {newsItems.map((item, i) => (
          <li
            key={i}
            className="rounded-[20px] border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:bg-white/8"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#7CC6FF]">{item.date}</p>
            <p className="mt-1 font-medium text-slate-50">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="pt-2">
        <Button size="lg" type="button" variant="brand" asChild className="gap-2 rounded-[var(--radius)]">
          <NextLink href="/bible-strong">
            <BookOpen className="size-5" aria-hidden />
            {t("strongCta")}
          </NextLink>
        </Button>
      </div>
    </motion.section>
  );
}
