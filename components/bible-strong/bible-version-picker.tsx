import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { bibleVersionPath } from "@/lib/bible/paths";
import type { BibleVersionRow } from "@/lib/bible/types";

type Props = {
  versions: BibleVersionRow[];
  activeSlug: string | null;
};

export async function BibleVersionPicker({ versions, activeSlug }: Props) {
  const t = await getTranslations("bibleStrong");

  return (
    <section aria-labelledby="bible-versions-heading" className="space-y-3">
      <h2 id="bible-versions-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t("versionsHeading")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {versions.map((v) => {
          const isActive = v.slug === activeSlug;
          return (
            <NextLink
              key={v.id}
              href={bibleVersionPath(v.slug)}
              className={
                isActive
                  ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm"
                  : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
              }
            >
              <span>{v.title}</span>
              <span className="ml-1.5 text-xs uppercase opacity-70">{v.language}</span>
            </NextLink>
          );
        })}
      </div>
    </section>
  );
}