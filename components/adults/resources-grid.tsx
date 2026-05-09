import { ExternalLink, FileText, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getYoutubeThumbnail } from "@/lib/resources/youtube";
import type { ResourceRow } from "@/lib/resources/types";

export async function ResourcesGrid({ resources }: { resources: ResourceRow[] }) {
  const t = await getTranslations("resources");

  if (!resources.length) {
    return null;
  }

  return (
    <section
      id="decouvrir-ressources"
      className="scroll-mt-28 space-y-5 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md"
      aria-labelledby="resources-heading"
    >
      <div className="flex items-center gap-2 text-foreground">
        <Play className="size-7 text-primary" aria-hidden />
        <h2 id="resources-heading" className="text-xl font-semibold tracking-tight md:text-2xl">
          {t("heading")}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">{t("subheading")}</p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => {
          const thumb =
            r.resource_type === "youtube" && r.youtube_url
              ? getYoutubeThumbnail(r.youtube_url)
              : null;
          return (
          <li key={r.id}>
            {r.resource_type === "youtube" && r.youtube_url ? (
              <article className="group overflow-hidden rounded-[20px] border border-border bg-background/40 shadow-md transition hover:border-primary/40 hover:shadow-lg">
                <a
                  href={r.youtube_url}
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
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-card">
                        <Play className="size-12 text-primary" aria-hidden />
                      </div>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-90 transition group-hover:bg-black/45">
                      <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">
                        <Play className="size-4" aria-hidden />
                        {t("watch")}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {t("badgeYoutube")}
                      </p>
                      <h3 className="mt-1 font-semibold leading-snug text-foreground">{r.title}</h3>
                    </div>
                    <ExternalLink className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                </a>
              </article>
            ) : r.resource_type === "pdf" && r.pdf_url ? (
              <article className="flex h-full flex-col justify-between rounded-[20px] border border-border bg-gradient-to-br from-background/80 to-card/60 p-5 shadow-md transition hover:border-primary/40 hover:shadow-lg">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {t("badgePdf")}
                  </p>
                  <div className="mt-3 flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-primary/15 text-primary">
                      <FileText className="size-7" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug text-foreground">{r.title}</h3>
                      {r.pdf_filename ? (
                        <p className="mt-1 truncate text-sm text-muted-foreground">{r.pdf_filename}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <a
                    href={r.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
                  >
                    <FileText className="size-4" aria-hidden />
                    {t("openPdf")}
                  </a>
                </div>
              </article>
            ) : null}
          </li>
          );
        })}
      </ul>
    </section>
  );
}
