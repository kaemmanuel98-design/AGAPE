import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { fetchBibleVersions, fetchVerseSummariesForVersion } from "@/lib/bible/queries";

type Props = {
  /** Identifiant de version sélectionné (query `?version=`). */
  selectedVersionId?: string | null;
};

/**
 * Page d’accueil Bible Strong : liste des versions puis des versets (liens vers `/bible-strong/[id]`).
 */
export async function BibleStrongIndexView({ selectedVersionId }: Props) {
  const t = await getTranslations("bibleStrong");
  const versions = await fetchBibleVersions();

  if (versions.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200/80 bg-white/60 px-6 py-14 text-center text-slate-800 shadow-sm">
        <p className="text-lg font-semibold">{t("emptyVersesTitle")}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("emptyVersesBody")}</p>
      </div>
    );
  }

  const active =
    (selectedVersionId ? versions.find((v) => v.id === selectedVersionId) : null) ?? versions[0]!;
  const summaries = await fetchVerseSummariesForVersion(active.id);

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <header className="space-y-2 border-b border-amber-900/10 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800/80">AGAPE</p>
        <h1 className="font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif] text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {t("readerTitle")}
        </h1>
        <p className="text-base leading-relaxed text-slate-600">{t("readerSubtitle")}</p>
      </header>

      <section aria-labelledby="bible-versions-heading" className="space-y-3">
        <h2 id="bible-versions-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("versionsHeading")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {versions.map((v) => {
            const isActive = v.id === active.id;
            return (
              <NextLink
                key={v.id}
                href={`/bible-strong?version=${v.id}`}
                className={
                  isActive
                    ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                }
              >
                {v.title}
              </NextLink>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="bible-verses-heading" className="space-y-4">
        <h2 id="bible-verses-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("versesHeading")}
        </h2>
        {summaries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-10 text-center text-sm text-slate-600">
            {t("noVersesInVersion")}
          </p>
        ) : (
          <ul className="max-h-[min(70vh,36rem)] space-y-1 overflow-y-auto rounded-xl border border-slate-200/80 bg-white/80 p-2 shadow-inner">
            {summaries.map((s) => (
              <li key={s.id}>
                <NextLink
                  href={`/bible-strong/${s.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-800 hover:bg-amber-100/60 hover:text-slate-950"
                >
                  <span className="font-medium">{s.book_title}</span>{" "}
                  <span className="text-slate-500">
                    {s.chapter}:{s.verse}
                  </span>
                </NextLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
