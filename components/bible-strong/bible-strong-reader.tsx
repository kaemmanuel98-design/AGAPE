import { BookOpen, ExternalLink, Video } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

const STRONG_LEXICON_URL =
  "https://www.blueletterbible.org/search/search.cfm?criteria=&tab=lexicon";

/**
 * URL complète d’intégration (iframe) — ex. `https://www.youtube.com/embed/xxxxx` ou player Vimeo.
 * Définir dans `.env` : NEXT_PUBLIC_BIBLE_STRONG_EMBED_URL
 */
function getEmbedUrl() {
  const raw = process.env.NEXT_PUBLIC_BIBLE_STRONG_EMBED_URL?.trim();
  return raw && (raw.startsWith("https://") || raw.startsWith("http://")) ? raw : null;
}

export async function BibleStrongReader() {
  const t = await getTranslations("bibleStrong");
  const embedUrl = getEmbedUrl();

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16 pt-2">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">AGAPE</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("title")}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{t("subtitle")}</p>
      </header>

      {/* Ici commence la section vidéo : lecteur responsive (16/9) pour YouTube ou Vimeo via URL d’embed */}
      <section aria-labelledby="bible-strong-video-heading" className="space-y-4">
        <h2 id="bible-strong-video-heading" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
          <Video className="size-5 shrink-0 text-primary" aria-hidden />
          {t("videoHeading")}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("videoIntro")}</p>
        {embedUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-black/40 shadow-lg">
            <div className="relative aspect-video w-full">
              <iframe
                title={t("videoIframeTitle")}
                src={embedUrl}
                className="absolute inset-0 size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
            {t("videoPlaceholder")}
          </div>
        )}
      </section>

      {/* Bloc article : texte structuré ; les paragraphes viendront plus tard d’une source CMS / base si besoin */}
      <article className="space-y-4 text-foreground">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{t("articleHeading")}</h2>
        <p className="text-base leading-relaxed text-muted-foreground">{t("articleP1")}</p>
        <p className="text-base leading-relaxed text-muted-foreground">{t("articleP2")}</p>
        <ul className="list-inside list-disc space-y-2 pl-1 text-base leading-relaxed text-muted-foreground marker:text-primary">
          <li>{t("articleLi1")}</li>
          <li>{t("articleLi2")}</li>
          <li>{t("articleLi3")}</li>
        </ul>
        <p className="text-base leading-relaxed text-muted-foreground">{t("articleP3")}</p>
      </article>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="default" className="rounded-xl">
          <a href={STRONG_LEXICON_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
            <BookOpen className="size-4" aria-hidden />
            {t("openLexicon")}
            <ExternalLink className="size-3.5 opacity-70" aria-hidden />
          </a>
        </Button>
      </div>
    </div>
  );
}
