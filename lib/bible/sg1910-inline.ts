import { normalizeStrongCode } from "@/lib/bible/strong-code";

/** Convertit le XML Segond+Strong (concordance.bible) en texte `mot[H123]`. */
export function sg1910XmlToInline(text: string): string {
  let out = text.replace(/<w strong="([GH]0*\d+)">([^<]*)<\/w>/gi, (_, rawCode, word) => {
    const code = normalizeStrongCode(rawCode);
    if (!code) return word;
    const w = word.trim();
    return w ? `${w}[${code}]` : "";
  });
  out = out.replace(/<[^>]+>/g, "");
  return out.replace(/\s+/g, " ").trim();
}
