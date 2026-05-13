"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  /** Titre proposé au système de partage natif (OS). */
  shareTitle: string;
  /** Texte d’accompagnement du lien (SMS, e-mail, etc.). */
  shareText: string;
};

/**
 * Enveloppe de lecture GYNOSKO : barre de progression en haut + zone de contenu + partage en bas.
 *
 * — Progression : calculée sur le scroll du `document` ; adapte les couleurs selon l’avancement dans le manuscrit.
 * — Partage : utilise l’API Web Share quand elle existe ; sinon copie le lien dans le presse-papiers.
 * — Ne modifie pas la logique de parsing des chapitres : elle est dans `book-reader-body.tsx` / `BookReader.tsx`.
 */
export function ReaderLayout({ children, shareTitle, shareText }: Props) {
  const t = useTranslations("academy");
  const [progress, setProgress] = useState(0);
  /** Message court après copie du lien (fallback sans Web Share). */
  const [copyHint, setCopyHint] = useState(false);

  const updateProgress = useCallback(() => {
    const el = document.documentElement;
    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) {
      setProgress(0);
      return;
    }
    const ratio = el.scrollTop / scrollable;
    setProgress(Math.min(1, Math.max(0, ratio)));
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      }
    } catch {
      /* Annulation utilisateur ou erreur : on tente la copie. */
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopyHint(true);
      window.setTimeout(() => setCopyHint(false), 3500);
    } catch {
      /* Dernier recours : ouvre un mailto avec le lien encodé. */
      window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`;
    }
  };

  /* Teinte de la barre : du bleu nuit (début de lecture) vers le doré (fin du document). */
  const hue = Math.round(220 - progress * 175);
  const sat = Math.round(38 + progress * 32);
  const light = Math.round(22 + progress * 28);
  const barBackground = `linear-gradient(90deg, hsl(222 45% 18%), hsl(${hue} ${sat}% ${light}%))`;

  return (
    <>
      {/* Barre de progression fixe en haut de l’écran — largeur = % de scroll ; couleur évolue avec `progress`. */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-[3px] bg-stone-200/30 dark:bg-stone-800/50"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${Math.round(progress * 100)} %`}
        aria-label={t("readerProgressLabel")}
      >
        <div
          className="h-full origin-left transition-[width] duration-150 ease-out"
          style={{
            width: `${progress * 100}%`,
            background: barBackground,
            boxShadow: progress > 0.02 ? "0 0 12px rgba(251,191,36,0.35)" : undefined,
          }}
        />
      </div>

      {children}

      {/* Zone « Partager » : en bas de page, sous le contenu transmis en `children`. */}
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-4 text-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-full border-stone-400/60 bg-white/70 px-8 text-[18px] font-medium text-stone-800 hover:bg-white md:text-base dark:border-stone-600 dark:bg-stone-900/80 dark:text-stone-100"
          onClick={() => void handleShare()}
        >
          <Share2 className="size-4 shrink-0" aria-hidden />
          {t("readerShareButton")}
        </Button>
        {copyHint ? (
          <p className="mt-3 text-[18px] text-emerald-700 dark:text-emerald-400" role="status">
            {t("readerShareCopied")}
          </p>
        ) : null}
      </div>
    </>
  );
}
