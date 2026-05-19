export type BibleTextSegment =
  | { kind: "text"; value: string }
  | { kind: "strong"; code: string; word: string };

/** Retire les balises HTML simples (ex. `<em>` dans certaines sources). */
export function stripSimpleHtml(text: string): string {
  return text.replace(/<\/?(?:em|i|b|strong|span)[^>]*>/gi, "");
}

/**
 * Découpe un verset avec numéros Strong :
 * - `(G123)` / `(H456)` (édition manuelle Supabase)
 * - `mot[G1234]` (source kaiserlik / KJV+Strong)
 */
export function segmentsFromBodyText(text: string): BibleTextSegment[] {
  const clean = stripSimpleHtml(text);
  const re = /(\S*?)\[(G|H)0*(\d+)\]|\(([GH])0*(\d+)\)/g;
  const out: BibleTextSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(clean)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", value: clean.slice(last, m.index) });
    }
    if (m[4]) {
      const code = `${m[4]}${m[5]}`;
      out.push({ kind: "strong", code, word: "" });
    } else {
      const word = m[1] ?? "";
      const code = `${m[2]}${m[3]}`;
      out.push({ kind: "strong", code, word });
    }
    last = m.index + m[0].length;
  }

  if (last < clean.length) {
    out.push({ kind: "text", value: clean.slice(last) });
  }

  return out.length ? out : [{ kind: "text", value: clean }];
}
