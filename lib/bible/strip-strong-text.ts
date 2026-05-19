import { stripSimpleHtml } from "@/lib/bible/parse-strong-text";

/**
 * Retire les numéros Strong et balises associées pour n’afficher que le texte biblique.
 */
export function stripStrongFromBodyText(text: string): string {
  let t = stripSimpleHtml(text);
  t = t.replace(/<w strong="[^"]*">([^<]*)<\/w>/gi, "$1");
  t = t.replace(/(\S*?)\[(?:G|H)0*\d+\]/gi, "$1");
  t = t.replace(/\((?:G|H)0*\d+\)/gi, "");
  return t.replace(/\s{2,}/g, " ").trim();
}
