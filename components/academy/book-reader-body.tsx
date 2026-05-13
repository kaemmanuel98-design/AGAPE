import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * --- CONVENTIONS POUR AJOUTER DES CHAPITRES (texte admin / `text_content`) ---
 *
 * 1) Titres de chapitres : une ligne commençant par `## ` (ex. `## Chapitre 2 — La foi`).
 *    Entre deux chapitres `##`, un séparateur « Méditation » (✦ ✦ ✦) est inséré automatiquement.
 *
 * 2) Introduction + lettrine : place un titre contenant « Introduction », par ex. `## Introduction`.
 *    Le premier paragraphe qui suit recevra la grande lettrine décorative.
 *
 * 3) Versets bibliques : chaque ligne commence par `>` (comme une citation Markdown). Exemple :
 *    > Car Dieu a tant aimé le monde…
 *    > (Jean 3:16)
 *    Une ligne vide termine le bloc de versets.
 *
 * 4) Pause « Méditation » manuelle : une ligne contenant seulement `***` ou `---` ou `* * *`.
 *
 * 5) Taille du texte : le confort mobile (18px minimum) est défini dans `BookReader.tsx` via `blockClasses`
 *    — ne réduis pas les classes `text-[18px]` sans vérifier la lisibilité sur téléphone.
 */

/** Détecte un titre d’introduction (pour activer la lettrine sur le paragraphe suivant). */
function isIntroductionHeading(title: string): boolean {
  return /introduction/i.test(title.trim());
}

/** Ligne réservée au séparateur de méditation (en complément des pauses auto entre chapitres `##`). */
function isExplicitMeditationLine(trimmed: string): boolean {
  return trimmed === "***" || trimmed === "---" || trimmed === "* * *" || trimmed === "· · ·";
}

/**
 * Extrait la première lettre pour la lettrine (guillemets et espaces en tête ignorés).
 */
function splitDropCapParagraph(body: string): { cap: string; rest: string } | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  for (let i = 0; i < trimmed.length; ) {
    const codePoint = trimmed.codePointAt(i);
    if (codePoint === undefined) break;
    const ch = String.fromCodePoint(codePoint);
    const len = ch.length;
    if (/\p{L}/u.test(ch)) {
      return { cap: ch, rest: trimmed.slice(i + len) };
    }
    i += len;
  }
  return null;
}

export type BookReaderBlockClasses = {
  /** Corps du texte (Merriweather / Georgia). */
  paragraphClass: string;
  /** Titre principal (#) — centré, élégant. */
  heading1Class: string;
  /** Titre de chapitre (##) — centré. */
  heading2Class: string;
  /** Sous-titres (###). */
  heading3Class: string;
  /** Bloc de versets bibliques (italique, centré, bordure gauche). */
  verseBlockClass: string;
};

/** Séparateur visuel « Méditation » entre les chapitres (trois petites étoiles). */
function BookMeditationBreak({ className }: { className?: string }) {
  return (
    <div
      className={cn("my-12 flex select-none justify-center gap-3 text-lg text-amber-700/55 dark:text-amber-300/50", className)}
      role="separator"
      aria-label="Méditation"
    >
      <span aria-hidden>✦</span>
      <span aria-hidden>✦</span>
      <span aria-hidden>✦</span>
    </div>
  );
}

type Props = {
  text: string;
  className?: string;
  blockClasses: BookReaderBlockClasses;
};

/**
 * Parse le manuscrit : paragraphes, titres, versets `>`, pauses méditation, lettrine sur l’introduction.
 */
export function BookReaderBody({ text, className, blockClasses }: Props) {
  const blocks = parseGynoskoManuscript(text, blockClasses);
  return <div className={cn("space-y-6", className)}>{blocks}</div>;
}

function parseGynoskoManuscript(raw: string, c: BookReaderBlockClasses): ReactNode[] {
  /* Parcours ligne à ligne : on ne charge pas de bibliothèque Markdown externe pour garder le contrôle du rendu. */
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const out: ReactNode[] = [];
  let buffer: string[] = [];
  let key = 0;
  /** Compteur de titres `##` pour insérer une méditation entre chapitres (pas avant le premier). */
  let h2ChapterCount = 0;
  /** Si vrai, le prochain paragraphe reçoit la lettrine (après un titre « Introduction »). */
  let applyDropCapNext = false;
  /** Évite une double lettrine si plusieurs paragraphes suivent l’introduction. */
  let introLettrineDone = false;

  const flushParagraph = () => {
    const body = buffer.join("\n").trim();
    buffer = [];
    if (!body) return;

    if (applyDropCapNext && !introLettrineDone) {
      applyDropCapNext = false;
      introLettrineDone = true;
      const dc = splitDropCapParagraph(body);
      if (dc) {
        out.push(
          <p
            key={`p-dc-${key++}`}
            className={cn(c.paragraphClass, "first-para-drop-cap-wrap")}
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span className="drop-cap" aria-hidden="true">
              {dc.cap}
            </span>
            {dc.rest}
          </p>,
        );
        return;
      }
    }

    out.push(
      <p key={`p-${key++}`} className={c.paragraphClass} style={{ whiteSpace: "pre-wrap" }}>
        {body}
      </p>,
    );
  };

  const flushVerseBlock = (verseLines: string[]) => {
    if (verseLines.length === 0) return;
    const joined = verseLines.join("\n").trim();
    if (!joined) return;
    out.push(
      <blockquote
        key={`verse-${key++}`}
        className={cn(c.verseBlockClass, "verse-scripture-block")}
      >
        {verseLines.map((vl, idx) => (
          <p key={idx} className="whitespace-pre-wrap">
            {vl}
          </p>
        ))}
      </blockquote>,
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (t === "") {
      flushParagraph();
      continue;
    }

    /* Bloc verset : lignes consécutives commençant par « > » (une ligne vide termine le bloc). */
    if (t.startsWith(">")) {
      flushParagraph();
      const verseLines: string[] = [];
      let j = i;
      for (; j < lines.length; j++) {
        const tj = lines[j].trim();
        if (tj === "") break;
        if (!tj.startsWith(">")) break;
        verseLines.push(tj.replace(/^>\s?/, ""));
      }
      i = j - 1;
      flushVerseBlock(verseLines);
      continue;
    }

    /* Espace de méditation explicite dans le manuscrit */
    if (isExplicitMeditationLine(t)) {
      flushParagraph();
      out.push(<BookMeditationBreak key={`med-explicit-${key++}`} />);
      continue;
    }

    if (t.startsWith("### ")) {
      flushParagraph();
      /* Sous-partie dans un chapitre — reste alignée à gauche dans `BookReader.tsx`. */
      out.push(
        <h3 key={`h3-${key++}`} className={c.heading3Class}>
          {t.slice(4).trim()}
        </h3>,
      );
      continue;
    }

    if (t.startsWith("## ")) {
      flushParagraph();
      /* Entre chapitres : séparateur élégant avant chaque nouveau `##` sauf le tout premier. */
      if (h2ChapterCount >= 1) {
        out.push(<BookMeditationBreak key={`med-ch-${key++}`} />);
      }
      h2ChapterCount += 1;
      const title = t.slice(3).trim();
      if (isIntroductionHeading(title)) {
        applyDropCapNext = true;
      }
      out.push(
        <h2 key={`h2-${key++}`} className={c.heading2Class}>
          {title}
        </h2>,
      );
      continue;
    }

    if (t.startsWith("# ")) {
      flushParagraph();
      const title = t.slice(2).trim();
      if (isIntroductionHeading(title)) {
        applyDropCapNext = true;
      }
      out.push(
        <h2 key={`h1-${key++}`} className={c.heading1Class}>
          {title}
        </h2>,
      );
      continue;
    }

    /* Ligne de texte courante : accumulée jusqu’à la prochaine ligne vide ou titre. */
    buffer.push(line);
  }

  flushParagraph();
  return out;
}
