"use client";

import { motion } from "framer-motion";
import { BookOpen, CalendarDays, ChevronDown, Newspaper } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const STRONG_LEXICON_URL =
  "https://www.blueletterbible.org/search/search.cfm?criteria=&tab=lexicon";

type NewsItem = { title: string; date: string; body: string };

export function AdultsHomeHero() {
  const t = useTranslations("home.adults");

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button size="lg" type="button" asChild className="rounded-[var(--radius)]">
          <a href="#decouvrir-ressources">
            <ChevronDown className="size-5 opacity-90" aria-hidden />
            {t("ctaResources")}
          </a>
        </Button>

        <Button variant="secondary" size="lg" type="button" asChild className="rounded-[var(--radius)]">
          <Link href="/calendar">
            <CalendarDays className="size-5" aria-hidden />
            {t("calendarLink")}
          </Link>
        </Button>

        <Button variant="outline" size="lg" type="button" asChild className="rounded-[var(--radius)]">
          <a href={STRONG_LEXICON_URL} target="_blank" rel="noopener noreferrer">
            <BookOpen className="size-5" aria-hidden />
            {t("strongCtaShort")}
          </a>
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
      className="scroll-mt-28 space-y-5 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md"
      aria-labelledby="news-heading"
    >
      <div className="flex items-center gap-2 text-foreground">
        <Newspaper className="size-7 text-primary" aria-hidden />
        <h2 id="news-heading" className="text-xl font-semibold tracking-tight md:text-2xl">
          {t("newsTitle")}
        </h2>
      </div>

      <ul className="space-y-4">
        {newsItems.map((item, i) => (
          <li
            key={i}
            className="rounded-[20px] border border-border bg-background/40 px-5 py-4 transition-colors hover:bg-background/55"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-primary">{item.date}</p>
            <p className="mt-1 font-medium text-foreground">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="pt-2">
        <Button size="lg" type="button" asChild className="gap-2 rounded-[var(--radius)]">
          <a href={STRONG_LEXICON_URL} target="_blank" rel="noopener noreferrer">
            <BookOpen className="size-5" aria-hidden />
            {t("strongCta")}
          </a>
        </Button>
      </div>
    </motion.section>
  );
}
