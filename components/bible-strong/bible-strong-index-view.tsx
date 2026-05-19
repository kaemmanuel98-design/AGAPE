import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { BibleStrongHeader } from "@/components/bible-strong/bible-strong-header";
import { BibleVersionPicker } from "@/components/bible-strong/bible-version-picker";
import { bibleVersionPath } from "@/lib/bible/paths";
import { fetchBibleVersions } from "@/lib/bible/queries";

export async function BibleStrongIndexView() {
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

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <BibleStrongHeader />
      <BibleVersionPicker versions={versions} activeSlug={null} />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("chooseTranslation")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {versions.map((v) => (
            <li key={v.id}>
              <NextLink
                href={bibleVersionPath(v.slug)}
                className="block rounded-2xl border border-slate-200/90 bg-white/90 px-5 py-4 shadow-sm transition hover:border-amber-300/80 hover:shadow-md"
              >
                <p className="font-semibold text-slate-900">{v.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{v.language}</p>
                {v.notes ? <p className="mt-2 text-sm text-slate-600 line-clamp-2">{v.notes}</p> : null}
                <p className="mt-3 text-sm font-medium text-sky-800">{t("openBible")} →</p>
              </NextLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
