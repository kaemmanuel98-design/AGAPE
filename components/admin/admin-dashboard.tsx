"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { fr, enUS, nl } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Home,
  Loader2,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { createContent, deleteContent } from "@/lib/actions/admin-contents";
import type { ContentRow } from "@/lib/contents/types";

const localeMap = { fr, en: enUS, nl };

export function AdminDashboard({ initialContents }: { initialContents: ContentRow[] }) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale() as keyof typeof localeMap;
  const dfLocale = localeMap[locale] ?? fr;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initialContents);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialContents);
  }, [initialContents]);

  const dateFmt = useMemo(
    () => (iso: string) => {
      try {
        return format(new Date(iso), "PPp", { locale: dfLocale });
      } catch {
        return iso;
      }
    },
    [dfLocale],
  );

  function translateError(code: string) {
    switch (code) {
      case "missing_fields":
        return t("errors.missing_fields");
      case "invalid_type":
        return t("errors.invalid_type");
      case "invalid_category":
        return t("errors.invalid_category");
      case "invalid_youtube":
        return t("errors.invalid_youtube");
      case "invalid_pdf_url":
        return t("errors.invalid_pdf_url");
      case "unauthorized":
        return t("errors.unauthorized");
      case "forbidden":
        return t("errors.forbidden");
      case "missing_id":
        return t("errors.missing_id");
      default:
        return code || t("errors.generic");
    }
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set("locale", locale);
    startTransition(async () => {
      const res = await createContent(fd);
      if (res.ok) {
        setFormMsg(t("created"));
        e.currentTarget.reset();
        router.refresh();
      } else {
        setFormMsg(translateError(String(res.message ?? "")));
      }
    });
  }

  async function onDelete(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("locale", locale);
      const res = await deleteContent(fd);
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-12">
      <header className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Agapé
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-slate-300 bg-white/80 px-4 text-slate-800 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              asChild
            >
              <Link href="/" className="gap-2">
                <Home className="size-4" />
                {t("home")}
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-slate-300 bg-white/80 px-4 text-slate-800 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
              asChild
            >
              <Link href="/calendar" className="gap-2">
                <CalendarDays className="size-4" />
                {t("calendar")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="rounded-[28px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <Plus className="size-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t("formTitle")}</h2>
        </div>

        <form onSubmit={(e) => void onCreate(e)} className="grid gap-5">
          <div className="grid gap-2">
            <label htmlFor="c-title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("fieldTitle")}
            </label>
            <input
              id="c-title"
              name="title"
              required
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
              placeholder={t("placeholderTitle")}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <label htmlFor="c-type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("fieldType")}
              </label>
              <select
                id="c-type"
                name="content_type"
                required
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
              >
                <option value="video">{t("typeVideo")}</option>
                <option value="pdf">{t("typePdf")}</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="c-category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("fieldCategory")}
              </label>
              <select
                id="c-category"
                name="category"
                required
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
              >
                <option value="adult">{t("catAdult")}</option>
                <option value="child">{t("catChild")}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="c-url" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("fieldUrl")}
            </label>
            <input
              id="c-url"
              name="content_url"
              type="url"
              required
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-slate-400/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-50"
              placeholder={t("placeholderUrl")}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("hintUrl")}</p>
          </div>

          {formMsg ? (
            <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
              {formMsg}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className="h-12 rounded-2xl bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
            {t("publish")}
          </Button>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t("listTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("listSubtitle")}</p>

        <ul className="mt-6 divide-y divide-slate-200 dark:divide-white/10">
          {items.length === 0 ? (
            <li className="py-10 text-center text-sm text-slate-500">{t("empty")}</li>
          ) : (
            items.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                    {row.content_type === "video" ? (
                      <Video className="size-5 text-slate-700 dark:text-slate-200" />
                    ) : (
                      <FileText className="size-5 text-slate-700 dark:text-slate-200" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-50">{row.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{dateFmt(row.created_at)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {row.content_type === "video" ? t("typeVideo") : t("typePdf")}
                      </span>
                      <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white dark:bg-white dark:text-slate-900">
                        {row.category === "adult" ? t("catAdult") : t("catChild")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={row.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    {t("open")}
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    className="h-10 rounded-full border-red-200/80 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                    aria-label={t("deleteAria")}
                    onClick={() => void onDelete(row.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
