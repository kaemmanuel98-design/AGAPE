import "server-only";

import { normalizeStrongCode } from "@/lib/bible/strong-code";

const GREEK_URL =
  "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js";
const HEBREW_URL =
  "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js";

export type StrongLocale = "fr" | "en" | "nl";

export type StrongEntry = {
  code: string;
  lemma: string | null;
  translit: string | null;
  /** Définition dans la langue demandée (fallback anglais si non dispo). */
  definition: string | null;
  definitionEn: string | null;
  kjv: string | null;
  derivation: string | null;
};

type RawStrong = {
  lemma?: string;
  translit?: string;
  kjv_def?: string;
  strongs_def?: string;
  strong_def?: string;
  derivation?: string;
};

let greekDict: Record<string, RawStrong> | null = null;
let hebrewDict: Record<string, RawStrong> | null = null;

function parseDictionaryJs(raw: string): Record<string, RawStrong> {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Invalid Strong dictionary format");
  }
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, RawStrong>;
}

async function loadDict(isGreek: boolean): Promise<Record<string, RawStrong>> {
  if (isGreek && greekDict) return greekDict;
  if (!isGreek && hebrewDict) return hebrewDict;

  const url = isGreek ? GREEK_URL : HEBREW_URL;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Strong dict fetch failed: ${res.status}`);
  const parsed = parseDictionaryJs(await res.text());
  if (isGreek) greekDict = parsed;
  else hebrewDict = parsed;
  return parsed;
}

function localizeDefinition(enDef: string | null, locale: StrongLocale): string | null {
  if (!enDef) return null;
  if (locale === "en") return enDef;
  return enDef;
}

export async function getStrongEntry(
  code: string,
  locale: StrongLocale = "en",
): Promise<StrongEntry | null> {
  const normalized = normalizeStrongCode(code);
  if (!normalized) return null;

  const isGreek = normalized.startsWith("G");
  const dict = await loadDict(isGreek);
  const raw = dict[normalized];
  if (!raw) return null;

  const definitionEn = raw.strongs_def ?? raw.strong_def ?? null;

  return {
    code: normalized,
    lemma: raw.lemma ?? null,
    translit: raw.translit ?? null,
    definition: localizeDefinition(definitionEn, locale),
    definitionEn,
    kjv: raw.kjv_def ?? null,
    derivation: raw.derivation ?? null,
  };
}
