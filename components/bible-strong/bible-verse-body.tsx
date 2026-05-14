import Link from "next/link";

type Segment =
  | { kind: "text"; value: string }
  | { kind: "strong"; code: string };

/**
 * Découpe le texte pour repérer les numéros Strong au format (G123) ou (H456).
 * — Les éditeurs peuvent coller le texte ainsi dans Supabase sans toucher au code.
 */
function segmentsFromBodyText(text: string): Segment[] {
  const re = /\(([GH]\d+)\)/g;
  const out: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", value: text.slice(last, m.index) });
    }
    out.push({ kind: "strong", code: m[1]! });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ kind: "text", value: text.slice(last) });
  }
  return out.length ? out : [{ kind: "text", value: text }];
}

function strongLexiconUrl(code: string) {
  const enc = encodeURIComponent(code);
  return `https://www.blueletterbible.org/lang/lexicon/lexicon.cfm?strongs=${enc}`;
}

type Props = {
  text: string;
  /** Classe Tailwind pour le conteneur (ex. typo serif + taille). */
  className?: string;
};

/**
 * Affichage du corps du verset : serif, numéros Strong cliquables vers le lexique Blue Letter Bible.
 */
export function BibleVerseBody({ text, className }: Props) {
  const segments = segmentsFromBodyText(text);

  return (
    <p className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return <span key={`t-${i}`}>{seg.value}</span>;
        }
        const href = strongLexiconUrl(seg.code);
        return (
          <Link
            key={`s-${i}-${seg.code}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-0.5 inline rounded-md bg-amber-100/80 px-1.5 py-0.5 text-sm font-semibold text-amber-950 underline decoration-amber-600/50 underline-offset-2 hover:bg-amber-200/90"
          >
            ({seg.code})
          </Link>
        );
      })}
    </p>
  );
}
