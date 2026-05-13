import { ArrowLeft, BookMarked, Download, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LessonRow } from "@/lib/academy/types";

type Props = {
  lesson: LessonRow;
};

/**
 * Mise en page « Fiche de lecture » pour les entrées `content_kind === "livre"`.
 * — `cover_image` : URL HTTPS (image hébergée sur ton stockage ou un CDN).
 * — `text_content` : résumé / 4e de couverture (zone « Résumé » à droite).
 * — `download_url` : URL directe du fichier PDF (bouton téléchargement).
 * — `external_link` : page web externe (liseuse, boutique, etc.).
 */
export async function AcademyBookReadingSheet({ lesson }: Props) {
  const t = await getTranslations("academy");
  const summary = lesson.text_content?.trim();
  const hasCover = Boolean(lesson.cover_image?.trim());

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" asChild className="w-fit rounded-full">
          <Link href="/academy" className="gap-2">
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {t("backToAcademy")}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{t("lessonBrand")}</span>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">{lesson.level}</span>
        </div>
      </div>

      <section className="rounded-[var(--radius)] border border-border bg-card/50 p-6 shadow-lg backdrop-blur-md sm:p-8">
        <p className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <BookMarked className="size-4" aria-hidden />
          {t("bookReadingSheet")}
        </p>

        <div className="grid gap-10 md:grid-cols-[minmax(12rem,16rem)_1fr] md:items-start md:gap-12">
          {/* Colonne gauche : image — colle ici l’URL publique de la jaquette (`cover_image` en base). */}
          <div className="mx-auto w-full max-w-[16rem] md:mx-0">
            <div
              className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_20px_50px_rgba(15,23,42,0.35)]"
              style={{ perspective: "800px" }}
            >
              {hasCover ? (
                // eslint-disable-next-line @next/next/no-img-element -- URL dynamique fournie par l’admin (hors domaine fixe).
                <img
                  src={lesson.cover_image!}
                  alt={t("bookCoverAlt", { title: lesson.title })}
                  className="size-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-center text-xs text-slate-400">
                  <BookMarked className="size-10 text-slate-500" aria-hidden />
                  {t("bookCoverPlaceholder")}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{lesson.module_title}</p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{lesson.title}</h1>
              {lesson.author?.trim() ? (
                <p className="text-base text-muted-foreground">
                  <span className="font-medium text-foreground">{t("bookAuthorLabel")}</span> {lesson.author}
                </p>
              ) : null}
            </header>

            {summary ? (
              <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{t("bookSummaryHeading")}</h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-base">{summary}</div>
              </div>
            ) : null}

            {/* Actions : renseigne `download_url` / `external_link` dans l’admin pour afficher les boutons. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {lesson.download_url?.trim() ? (
                <Button asChild className="rounded-xl">
                  <a href={lesson.download_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <Download className="size-4 shrink-0" aria-hidden />
                    {t("bookDownloadPdf")}
                  </a>
                </Button>
              ) : null}
              {lesson.external_link?.trim() ? (
                <Button variant="outline" asChild className="rounded-xl">
                  <a href={lesson.external_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <ExternalLink className="size-4 shrink-0" aria-hidden />
                    {t("bookReadOnline")}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
