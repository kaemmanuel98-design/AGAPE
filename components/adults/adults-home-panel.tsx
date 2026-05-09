"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, Newspaper } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
const STRONG_LEXICON_URL =
  "https://www.blueletterbible.org/search/search.cfm?criteria=&tab=lexicon";

type NewsItem = { title: string; date: string; body: string };

export function AdultsHomePanel() {
  const t = useTranslations("home.adults");
  const [open, setOpen] = useState(false);
  const newsItems = t.raw("newsItems") as NewsItem[];

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Button
        variant="glass"
        size="lg"
        type="button"
        className="gap-2"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {t("cta")}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown className="size-5 opacity-90" aria-hidden />
        </motion.span>
      </Button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.section
            key="discover"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            aria-label={t("newsTitle")}
          >
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-2 text-foreground">
                <Newspaper className="size-6 text-primary" aria-hidden />
                <h2 className="text-xl font-semibold tracking-tight">{t("newsTitle")}</h2>
              </div>

              <ul className="space-y-4">
                {newsItems.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.3 }}
                    className="rounded-[20px] border border-border bg-background/40 px-5 py-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {item.date}
                    </p>
                    <p className="mt-1 font-medium text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" type="button" asChild className="gap-2 rounded-[var(--radius)]">
                  <a
                    href={STRONG_LEXICON_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpen className="size-5" aria-hidden />
                    {t("strongCta")}
                  </a>
                </Button>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
