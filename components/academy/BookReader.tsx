import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Merriweather, Playfair_Display } from "next/font/google";
import { getTranslations } from "next-intl/server";

import { BookReaderBody } from "@/components/academy/book-reader-body";
import type { BookReaderBlockClasses } from "@/components/academy/book-reader-body";
import { ReaderLayout } from "@/components/academy/ReaderLayout";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LessonRow } from "@/lib/academy/types";

/** Titres (H1 / H2) : élégance classique, centrés — modifiable ici si tu changes la charte éditoriale. */
const playfairTitles = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/**
 * Corps du livre (Merriweather).
 * Sur mobile, on impose au moins 18px pour le confort de lecture (sans zoom).
 */
const merriweatherBody = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

type Props = {
  lesson: LessonRow;
};

/**
 * Page de lecture GYNOSKO complète.
 *
 * Rappels pour ajouter des chapitres sans casser le design :
 * — Contenu : champ `text_content` (admin) ; conventions dans `book-reader-body.tsx`.
 * — PDF / web : `download_url`, `external_link`.
 * — Jaquette : `cover_image`.
 * — UX globale : barre de progression + partage dans `ReaderLayout.tsx`.
 */
export async function BookReader({ lesson }: Props) {
  const t = await getTranslations("academy");
  const bodyText = lesson.text_content?.trim() ?? "";
  const pdfUrl = lesson.download_url?.trim();
  const webUrl = lesson.external_link?.trim();

  const titleFont = playfairTitles.className;
  const bodyFont = merriweatherBody.className;

  /* Classes passées au parseur : toute taille de corps en `text-[18px]` sur mobile (breakpoint par défaut). */
  const blockClasses: BookReaderBlockClasses = {
    paragraphClass: `${bodyFont} text-[18px] leading-[1.78] text-stone-800 sm:text-[1.125rem] sm:leading-[1.88] [&_strong]:font-semibold dark:text-stone-100`,
    heading1Class: `${titleFont} mt-6 text-center text-3xl font-bold tracking-tight text-stone-900 dark:text-[#FDFBF7] sm:text-4xl`,
    heading2Class: `${titleFont} mt-10 text-center text-2xl font-semibold tracking-tight text-stone-900 dark:text-[#F4EFE8] sm:text-3xl`,
    heading3Class: `${titleFont} mt-8 text-left text-lg font-semibold tracking-tight text-stone-800 dark:text-stone-200 sm:text-xl`,
    verseBlockClass: `${bodyFont} verse-scripture-shell mx-auto max-w-2xl border-l-4 border-amber-700/70 py-3 pl-5 pr-4 text-center text-[18px] italic leading-relaxed text-stone-800 shadow-sm dark:border-amber-400/60 dark:text-stone-100 sm:py-4 sm:pl-6 sm:pr-5 sm:text-[1.05rem]`,
  };

  return (
    <ReaderLayout shareTitle={t("readerShareTitle")} shareText={t("readerShareBody")}>
      <div className="book-reader-gynosko min-h-screen bg-[#FDFBF7] pb-8 pt-2 dark:bg-stone-950">
        {/* Conteneur principal : fond papier #FDFBF7 (identité lecture calme). */}
        <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
          {/* Barre de navigation interne (retour Academy). */}
          <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" asChild className="w-fit rounded-full border-stone-300 bg-white/80 dark:border-stone-600 dark:bg-stone-900/80">
              <Link href="/academy" className="gap-2">
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                {t("backToAcademy")}
              </Link>
            </Button>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{t("lessonBrand")}</span>
          </div>

          {/* En-tête éditorial fixe GYNOSKO (hors base de données). */}
          <header className="text-center">
            <h1 className={`${titleFont} text-4xl font-bold tracking-[0.12em] text-stone-900 dark:text-[#FDFBF7] sm:text-5xl md:text-6xl`}>
              GYNOSKO
            </h1>
            <p className={`${titleFont} mt-3 text-lg italic text-stone-600 dark:text-stone-400 sm:text-xl`}>
              Connaître Dieu, au-delà de la lettre
            </p>
          </header>

          {/* Bloc Dédicace : contenu statique ; pour l’éditer, modifie ce JSX (pas le parseur de chapitres). */}
          <section
            aria-labelledby="gynosko-dedicace-heading"
            className="mx-auto max-w-3xl rounded-2xl border border-amber-200/60 bg-gradient-to-br from-[#fdf6e8] via-[#faf3e0] to-[#f7efd6] px-6 py-7 shadow-inner dark:border-amber-900/40 dark:from-amber-950/50 dark:via-stone-900/90 dark:to-stone-950"
          >
            <h2 id="gynosko-dedicace-heading" className={`${titleFont} text-center text-sm font-semibold uppercase tracking-[0.2em] text-amber-900/90 dark:text-amber-200/90`}>
              Dédicace
            </h2>
            <p className={`${bodyFont} mt-4 text-center text-[18px] leading-relaxed text-stone-800 dark:text-stone-200`}>
              Avec une profonde gratitude,
            </p>
            <ul className={`${bodyFont} mt-4 list-none space-y-2 text-center text-[18px] text-stone-900 dark:text-stone-100 sm:text-lg`}>
              <li>Père</li>
              <li>Maman Lili N&apos;zola</li>
              <li>Maman Dordette</li>
            </ul>
          </section>

          {/* Zone « livre ouvert » : le manuscrit principal est rendu par `BookReaderBody` plus bas. */}
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-2xl border border-stone-300/50 bg-[#F0EBE3] p-1 shadow-[0_28px_70px_rgba(0,0,0,0.1)] ring-1 ring-stone-900/5 dark:border-stone-700 dark:bg-stone-900/60 dark:shadow-[0_28px_70px_rgba(0,0,0,0.45)]">
              <div
                className="pointer-events-none absolute inset-y-4 left-1/2 z-10 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-900/20 to-transparent md:block dark:via-amber-200/15"
                aria-hidden
              />
              <div className="relative grid gap-0 md:grid-cols-2">
                <div className="relative hidden min-h-[12rem] items-center justify-center bg-[#FDFBF7] p-6 md:flex dark:bg-[#252019]">
                  {lesson.cover_image?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL publique (Storage / CDN).
                    <img
                      src={lesson.cover_image}
                      alt=""
                      className="max-h-[min(28rem,70vh)] w-auto rounded-md object-contain shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-stone-900/10"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-48 w-36 rounded border border-dashed border-stone-400/25 bg-[#FDFBF7]/80 dark:border-stone-600 dark:bg-stone-800/40" aria-hidden />
                  )}
                </div>
                <div className="relative bg-[#FDFBF7] px-6 py-10 dark:bg-[#1f1c18] sm:px-10 md:px-12 md:py-14 lg:px-16">
                  <div className="mx-auto max-w-[40rem]">
                    {bodyText ? (
                      <BookReaderBody text={bodyText} blockClasses={blockClasses} />
                    ) : (
                      <p className={`${bodyFont} text-center text-[18px] text-stone-500 dark:text-stone-400`}>
                        Colle ici les chapitres dans « Texte de la leçon » : utilise <code className="rounded bg-stone-200/90 px-1 text-[0.9rem] dark:bg-stone-800">## Introduction</code> puis ton texte ; les versets commencent par{" "}
                        <code className="rounded bg-stone-200/90 px-1 text-[0.9rem] dark:bg-stone-800">&gt;</code> en début de ligne.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions PDF / lien externe — URLs issues de l’admin (`download_url`, `external_link`). */}
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4">
            {pdfUrl ? (
              <Button asChild size="lg" className="rounded-full px-8">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <Download className="size-5 shrink-0" aria-hidden />
                  Télécharger le manuscrit complet (PDF)
                </a>
              </Button>
            ) : (
              <p className="text-center text-[18px] text-stone-500 dark:text-stone-400">
                PDF complet : ajoute l&apos;URL HTTPS du fichier (champ « URL du PDF ») dans l&apos;admin.
              </p>
            )}
            {webUrl ? (
              <Button variant="outline" asChild className="rounded-full border-stone-300 dark:border-stone-600">
                <a href={webUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <ExternalLink className="size-4 shrink-0" aria-hidden />
                  Consulter en ligne
                </a>
              </Button>
            ) : null}
          </div>

          {/* Bénédiction finale — texte statique en fin de manuscrit affiché. */}
          <div
            className={`${titleFont} mx-auto max-w-4xl rounded-2xl border border-amber-100/80 bg-gradient-to-r from-amber-50/90 via-[#fff9f0] to-amber-50/90 px-6 py-10 text-center text-[18px] leading-relaxed text-stone-800 shadow-sm dark:border-amber-900/30 dark:from-amber-950/50 dark:via-stone-900 dark:to-amber-950/50 dark:text-stone-100 sm:px-10 sm:text-xl`}
            role="note"
          >
            <p className="font-semibold text-amber-900/90 dark:text-amber-200/90">Bénédiction</p>
            <p className="mt-4 italic text-stone-700 dark:text-stone-300">
              Que la paix de Dieu demeure sur chaque lecteur, et que Sa Parole continue d&apos;éclairer vos pas au-delà des
              lettres, jusqu&apos;au vivant cœur de l&apos;Évangile.
            </p>
          </div>
        </div>
      </div>
    </ReaderLayout>
  );
}
