"use client";

import type { FormEvent } from "react";
import { Bird, Heart, Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { createConfession } from "@/lib/actions/confessions";

export function KidsPrayerCard({ defaultName }: { defaultName?: string | null }) {
  const t = useTranslations("kidsPrayer");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createConfession(formData);
      if (result.ok) {
        setMessage(t("saved"));
        form.reset();
        if (defaultName) {
          const input = form.elements.namedItem("child_name");
          if (input instanceof HTMLInputElement) {
            input.value = defaultName;
          }
        }
        setOpen(false);
      } else if (result.message === "missing_fields") {
        setMessage(t("missingFields"));
      } else {
        setMessage(t("error"));
      }
    });
  }

  return (
    <section className="space-y-5 rounded-[36px] border border-pink-200/80 bg-gradient-to-br from-white/95 via-pink-50/95 to-yellow-50/95 p-8 shadow-[0_18px_54px_rgba(244,114,182,0.16)] backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">
            <Heart className="size-3.5" />
            {t("badge")}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {t("title")}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-slate-600">{t("subtitle")}</p>
        </div>

        <Button
          type="button"
          size="lg"
          className="rounded-full bg-white text-sky-700 shadow-md hover:bg-sky-50"
          onClick={() => setOpen((value) => !value)}
        >
          <Bird className="size-5" />
          {t("cta")}
        </Button>
      </div>

      {open ? (
        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4 rounded-[28px] border border-sky-200/80 bg-white/90 p-6 shadow-sm">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">{t("nameLabel")}</span>
            <input
              name="child_name"
              defaultValue={defaultName ?? ""}
              required
              className="h-12 rounded-2xl border border-sky-200 bg-white px-4 text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
              placeholder={t("namePlaceholder")}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">{t("heartLabel")}</span>
            <textarea
              name="message"
              required
              rows={4}
              className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
              placeholder={t("heartPlaceholder")}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending} className="rounded-full bg-sky-600 text-white hover:bg-sky-700">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {t("submit")}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
          </div>
        </form>
      ) : null}

      {message ? (
        <p className="rounded-2xl bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
