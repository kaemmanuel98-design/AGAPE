import type { ReactNode } from "react";

/**
 * Corps d'article lu depuis `lesson.text_content` (colonne Supabase `text_content`).
 * Collez votre texte dans l'admin : paragraphes séparés par une ligne vide ;
 * lignes commençant par `# `, `## ` ou `### ` deviennent des titres (hiérarchie claire).
 */
export function LessonArticleBody({ text }: { text: string }) {
  const blocks = parseArticleBlocks(text);
  return <div className="space-y-6">{blocks}</div>;
}

/**
 * Découpe le contenu brut en blocs (titres + paragraphes) pour une mise en forme lisible.
 */
function parseArticleBlocks(raw: string): ReactNode[] {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const out: ReactNode[] = [];
  let buffer: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    const body = buffer.join("\n").trim();
    buffer = [];
    if (!body) return;
    out.push(
      <p
        key={`p-${key++}`}
        className="text-[1.05rem] leading-[1.75] text-slate-800 dark:text-slate-100 sm:text-lg [&_strong]:font-semibold"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {body}
      </p>,
    );
  };

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("### ")) {
      flushParagraph();
      out.push(
        <h3 key={`h3-${key++}`} className="mt-8 scroll-mt-28 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
          {t.slice(4).trim()}
        </h3>,
      );
    } else if (t.startsWith("## ")) {
      flushParagraph();
      out.push(
        <h2 key={`h2-${key++}`} className="mt-10 scroll-mt-28 border-b border-slate-200/80 pb-2 text-2xl font-semibold tracking-tight text-slate-900 dark:border-slate-700 dark:text-slate-50 sm:text-3xl">
          {t.slice(3).trim()}
        </h2>,
      );
    } else if (t.startsWith("# ")) {
      flushParagraph();
      out.push(
        <h2 key={`h1-${key++}`} className="mt-6 scroll-mt-28 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {t.slice(2).trim()}
        </h2>,
      );
    } else if (t === "") {
      flushParagraph();
    } else {
      buffer.push(line);
    }
  }
  flushParagraph();
  return out;
}
