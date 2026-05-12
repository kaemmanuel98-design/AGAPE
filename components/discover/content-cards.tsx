import { ExternalLink, FileText, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getYoutubeThumbnail } from "@/lib/contents/youtube";
import type { ContentRow } from "@/lib/contents/types";

type Theme = "adult" | "kids";

export async function ContentCards({
  contents,
  theme,
  headingId = "discover-contents-heading",
  title,
  subtitle,
}: {
  contents: ContentRow[];
  theme: Theme;
  headingId?: string;
  title?: string;
  subtitle?: string;
}) {
  const t = await getTranslations("discover");

  if (!contents.length && theme !== "kids") {
    return null;
  }

  const surface =
    theme === "kids"
      ? "rounded-[40px] border border-white/70 bg-gradient-to-br from-white/96 via-sky-50/95 to-yellow-50/95 p-8 shadow-[0_22px_60px_rgba(56,189,248,0.16)] backdrop-blur-md"
      : "agape-brand-surface rounded-[var(--radius)] p-8";

  const titleClass =
    theme === "kids" ? "text-slate-900" : "text-slate-50";
  const mutedClass =
    theme === "kids" ? "text-slate-600" : "text-slate-300";

  return (
    <section
      id="decouvrir-contenus"
      className={`scroll-mt-28 space-y-5 ${surface}`}
      aria-labelledby={headingId}
    >
      <div className="flex items-center gap-2">
        <Play className={`size-7 ${theme === "kids" ? "text-sky-600" : "text-[#7CC6FF]"}`} aria-hidden />
        <h2 id={headingId} className={`text-xl font-semibold tracking-tight md:text-2xl ${titleClass}`}>
          {title ?? (theme === "kids" ? t("kidsHeading") : t("heading"))}
        </h2>
      </div>
      <p className={`text-sm ${mutedClass}`}>
        {subtitle ?? (theme === "kids" ? t("kidsSubheading") : t("subheading"))}
      </p>

      {!contents.length ? (
        <div className="rounded-[30px] border border-dashed border-sky-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-600">
          {t("kidsEmpty")}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {contents.map((item) => {
            const thumb =
              item.content_type === "video"
                ? getYoutubeThumbnail(item.content_url)
                : null;

            return (
              <li key={item.id}>
                {item.content_type === "video" ? (
                  <article
                    className={`group overflow-hidden rounded-[30px] border shadow-md transition hover:shadow-lg ${
                      theme === "kids"
                        ? "border-sky-200/80 bg-white/96 shadow-[0_14px_34px_rgba(56,189,248,0.12)] hover:border-sky-400/60"
                        : "border-white/10 bg-white/5 hover:border-[#7CC6FF]/40 hover:bg-white/7"
                    }`}
                  >
                    <a
                      href={item.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-slate-900">
                            <Play className="size-12 text-[#7CC6FF]" aria-hidden />
                          </div>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-90 transition group-hover:bg-black/40">
                          <span className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                            <Play className="size-4" aria-hidden />
                            {t("watch")}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3 p-4">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide ${theme === "kids" ? "text-sky-600" : "text-[#7CC6FF]"}`}>
                            {t("badgeVideo")}
                          </p>
                          <h3 className={`mt-1 font-semibold leading-snug ${titleClass}`}>{item.title}</h3>
                        </div>
                        <ExternalLink className={`mt-1 size-5 shrink-0 ${mutedClass}`} aria-hidden />
                      </div>
                    </a>
                  </article>
                ) : (
                  <article
                    className={`flex h-full flex-col justify-between rounded-[30px] border p-5 shadow-md transition hover:shadow-lg ${
                      theme === "kids"
                        ? "border-sky-200/80 bg-white/96 shadow-[0_14px_34px_rgba(56,189,248,0.12)] hover:border-sky-400/60"
                        : "border-white/10 bg-gradient-to-br from-white/7 to-slate-900/35 hover:border-[#7CC6FF]/40"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${theme === "kids" ? "text-sky-600" : "text-[#7CC6FF]"}`}>
                        {t("badgePdf")}
                      </p>
                      <div className="mt-3 flex items-start gap-3">
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-[16px] ${theme === "kids" ? "bg-primary/15 text-primary" : "bg-white/10 text-[#F4C95D]"}`}>
                          <FileText className="size-7" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold leading-snug ${titleClass}`}>{item.title}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5">
                      <a
                        href={item.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 rounded-[var(--radius)] px-4 py-2.5 text-sm font-medium shadow transition ${
                          theme === "kids"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 text-white shadow-[0_16px_32px_rgba(29,78,216,0.3)] hover:brightness-105"
                        }`}
                      >
                        <FileText className="size-4" aria-hidden />
                        {t("openPdf")}
                      </a>
                    </div>
                  </article>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
