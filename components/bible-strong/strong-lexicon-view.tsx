import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { bibleChapterPath, bibleVersionPath } from "@/lib/bible/paths";
import { fetchStrongTranslationGlosses, fetchStrongVerseContexts } from "@/lib/bible/queries";
import { normalizeStrongCode } from "@/lib/bible/strong-code";
import { getStrongEntry, type StrongLocale } from "@/lib/bible/strongs-dictionary";

type Props = {
  code: string;
  versionSlug?: string;
  returnHref?: string;
};

function blbUrl(code: string) {
  return `https://www.blueletterbible.org/lang/lexicon/lexicon.cfm?strongs=${encodeURIComponent(code)}`;
}

export async function StrongLexiconView({ code, versionSlug, returnHref }: Props) {
  const t = await getTranslations("bibleStrong");
  const rawLocale = await getLocale();
  const siteLocale: StrongLocale = rawLocale === "fr" || rawLocale === "nl" ? rawLocale : "en";
  const normalized = normalizeStrongCode(code);

  if (!normalized) {
    return (
      <div className="mx-auto max-w-xl px-6 py-14 text-center text-slate-700">
        <p>{t("lexiconInvalidCode")}</p>
        {returnHref ? (
          <NextLink href={returnHref} className="mt-4 inline-block text-sky-800 hover:underline">
            ← {t("backToChapter")}
          </NextLink>
        ) : null}
      </div>
    );
  }

  const entry = await getStrongEntry(normalized, siteLocale);
  const glossVersion = versionSlug ?? (siteLocale === "fr" ? "lsg" : "kjv");
  const [contexts, glosses] = await Promise.all([
    fetchStrongVerseContexts(normalized, { versionSlug: glossVersion, limit: 30 }),
    siteLocale === "fr" || siteLocale === "nl"
      ? fetchStrongTranslationGlosses(normalized, glossVersion)
      : Promise.resolve([] as string[]),
  ]);

  if (!entry) {
    return (
      <div className="mx-auto max-w-xl px-6 py-14 text-center">
        <p className="text-slate-700">{t("lexiconNotFound", { code: normalized })}</p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-10 pb-16">
      <nav className="text-sm">
        {returnHref ? (
          <NextLink href={returnHref} className="font-medium text-sky-800 hover:underline">
            ← {t("backToChapter")}
          </NextLink>
        ) : (
          <NextLink href="/bible-strong" className="font-medium text-sky-800 hover:underline">
            ← {t("backToIndex")}
          </NextLink>
        )}
      </nav>

      <header className="border-b border-amber-900/10 pb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-900/80">
          {normalized.startsWith("G") ? t("lexiconGreek") : t("lexiconHebrew")}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif] text-3xl font-bold text-slate-900">
          {entry.lemma}
          {entry.translit ? (
            <span className="ml-2 text-xl font-normal text-slate-600">({entry.translit})</span>
          ) : null}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Strong <span className="font-mono font-semibold">{normalized}</span>
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-amber-200/70 bg-amber-50/50 px-5 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {t("lexiconDefinition")}
        </h2>
        {entry.definition ? (
          <p className="text-[1.05rem] leading-relaxed text-slate-900">{entry.definition}</p>
        ) : null}
        {siteLocale !== "en" && entry.definitionEn ? (
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-medium">{t("lexiconDefinitionEn")} :</span> {entry.definitionEn}
          </p>
        ) : null}
        {entry.kjv ? (
          <p className="text-sm text-slate-600">
            <span className="font-medium">KJV :</span> {entry.kjv}
          </p>
        ) : null}
        {entry.derivation ? (
          <p className="text-sm italic text-slate-600">{entry.derivation}</p>
        ) : null}
        <a
          href={blbUrl(normalized)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-sky-800 hover:underline"
        >
          {t("lexiconExternal")} →
        </a>
      </section>

      {glosses.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            {t("lexiconGlosses")}
          </h2>
          <p className="flex flex-wrap gap-2">
            {glosses.map((g) => (
              <span
                key={g}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800"
              >
                {g}
              </span>
            ))}
          </p>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {t("lexiconContexts")}
        </h2>
        {contexts.length === 0 ? (
          <p className="text-sm text-slate-600">{t("lexiconNoContexts")}</p>
        ) : (
          <ul className="space-y-4">
            {contexts.map((ctx) => (
              <li
                key={ctx.id}
                className="rounded-xl border border-slate-200/90 bg-white/90 px-4 py-4 shadow-sm"
              >
                <NextLink
                  href={bibleChapterPath(ctx.version_slug, ctx.book_code, ctx.chapter) + `#v${ctx.verse}`}
                  className="text-sm font-semibold text-sky-800 hover:underline"
                >
                  {ctx.book_title} {ctx.chapter}:{ctx.verse}
                </NextLink>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{ctx.snippet}</p>
              </li>
            ))}
          </ul>
        )}
        {versionSlug ? (
          <NextLink
            href={bibleVersionPath(versionSlug)}
            className="text-sm font-medium text-sky-800 hover:underline"
          >
            {t("lexiconAllInVersion")} →
          </NextLink>
        ) : null}
      </section>
    </article>
  );
}
