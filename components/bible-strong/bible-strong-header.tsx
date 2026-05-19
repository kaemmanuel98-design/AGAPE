import { getTranslations } from "next-intl/server";

type Props = {
  versionTitle?: string | null;
};

export async function BibleStrongHeader({ versionTitle }: Props) {
  const t = await getTranslations("bibleStrong");

  return (
    <header className="space-y-2 border-b border-amber-900/10 pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800/80">AGAPE</p>
      <h1 className="font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif] text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        {t("readerTitle")}
      </h1>
      <p className="text-base leading-relaxed text-slate-600">{t("readerSubtitle")}</p>
      {versionTitle ? (
        <p className="text-sm font-medium text-amber-900/90">{versionTitle}</p>
      ) : null}
    </header>
  );
}
