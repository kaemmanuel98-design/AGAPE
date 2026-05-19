/**
 * Importe la Bible complète dans Supabase (bible_versions + bible_verses).
 *
 * Prérequis : .env.local avec NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
 * Tables : exécuter supabase/migrations/032_bible_strong_bootstrap.sql avant.
 *
 * Usage :
 *   node scripts/import-bible-full.mjs --preset lsg
 *   node scripts/import-bible-full.mjs --preset kjv
 *   node scripts/import-bible-full.mjs --preset all
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const LSG_LTR_URL =
  "https://raw.githubusercontent.com/bible-hub/Bibles/master/French__Louis_Segond_(1910)__ls1910__LTR.txt";
const KJV_JSON_URL =
  "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json";

/** Même ordre que lib/bible/canon.ts */
const CANON = [
  ["01O", "gen", 1, "Genèse", "Genesis"],
  ["02O", "exo", 2, "Exode", "Exodus"],
  ["03O", "lev", 3, "Lévitique", "Leviticus"],
  ["04O", "num", 4, "Nombres", "Numbers"],
  ["05O", "deu", 5, "Deutéronome", "Deuteronomy"],
  ["06O", "jos", 6, "Josué", "Joshua"],
  ["07O", "jdg", 7, "Juges", "Judges"],
  ["08O", "rut", 8, "Ruth", "Ruth"],
  ["09O", "1sa", 9, "1 Samuel", "1 Samuel"],
  ["10O", "2sa", 10, "2 Samuel", "2 Samuel"],
  ["11O", "1ki", 11, "1 Rois", "1 Kings"],
  ["12O", "2ki", 12, "2 Rois", "2 Kings"],
  ["13O", "1ch", 13, "1 Chroniques", "1 Chronicles"],
  ["14O", "2ch", 14, "2 Chroniques", "2 Chronicles"],
  ["15O", "ezr", 15, "Esdras", "Ezra"],
  ["16O", "neh", 16, "Néhémie", "Nehemiah"],
  ["17O", "est", 17, "Esther", "Esther"],
  ["18O", "job", 18, "Job", "Job"],
  ["19O", "psa", 19, "Psaumes", "Psalms"],
  ["20O", "pro", 20, "Proverbes", "Proverbs"],
  ["21O", "ecc", 21, "Ecclésiaste", "Ecclesiastes"],
  ["22O", "sng", 22, "Cantique des cantiques", "Song of Solomon"],
  ["23O", "isa", 23, "Ésaïe", "Isaiah"],
  ["24O", "jer", 24, "Jérémie", "Jeremiah"],
  ["25O", "lam", 25, "Lamentations", "Lamentations"],
  ["26O", "ezk", 26, "Ézéchiel", "Ezekiel"],
  ["27O", "dan", 27, "Daniel", "Daniel"],
  ["28O", "hos", 28, "Osée", "Hosea"],
  ["29O", "jol", 29, "Joël", "Joel"],
  ["30O", "amo", 30, "Amos", "Amos"],
  ["31O", "oba", 31, "Abdias", "Obadiah"],
  ["32O", "jon", 32, "Jonas", "Jonah"],
  ["33O", "mic", 33, "Michée", "Micah"],
  ["34O", "nah", 34, "Nahum", "Nahum"],
  ["35O", "hab", 35, "Habakuk", "Habakkuk"],
  ["36O", "zep", 36, "Sophonie", "Zephaniah"],
  ["37O", "hag", 37, "Aggée", "Haggai"],
  ["38O", "zec", 38, "Zacharie", "Zechariah"],
  ["39O", "mal", 39, "Malachie", "Malachi"],
  ["40N", "mat", 40, "Matthieu", "Matthew"],
  ["41N", "mrk", 41, "Marc", "Mark"],
  ["42N", "luk", 42, "Luc", "Luke"],
  ["43N", "jhn", 43, "Jean", "John"],
  ["44N", "act", 44, "Actes", "Acts"],
  ["45N", "rom", 45, "Romains", "Romans"],
  ["46N", "1co", 46, "1 Corinthiens", "1 Corinthians"],
  ["47N", "2co", 47, "2 Corinthiens", "2 Corinthians"],
  ["48N", "gal", 48, "Galates", "Galatians"],
  ["49N", "eph", 49, "Éphésiens", "Ephesians"],
  ["50N", "php", 50, "Philippiens", "Philippians"],
  ["51N", "col", 51, "Colossiens", "Colossians"],
  ["52N", "1th", 52, "1 Thessaloniciens", "1 Thessalonians"],
  ["53N", "2th", 53, "2 Thessaloniciens", "2 Thessalonians"],
  ["54N", "1ti", 54, "1 Timothée", "1 Timothy"],
  ["55N", "2ti", 55, "2 Timothée", "2 Timothy"],
  ["56N", "tit", 56, "Tite", "Titus"],
  ["57N", "phm", 57, "Philémon", "Philemon"],
  ["58N", "heb", 58, "Hébreux", "Hebrews"],
  ["59N", "jas", 59, "Jacques", "James"],
  ["60N", "1pe", 60, "1 Pierre", "1 Peter"],
  ["61N", "2pe", 61, "2 Pierre", "2 Peter"],
  ["62N", "1jn", 62, "1 Jean", "1 John"],
  ["63N", "2jn", 63, "2 Jean", "2 John"],
  ["64N", "3jn", 64, "3 Jean", "3 John"],
  ["65N", "jud", 65, "Jude", "Jude"],
  ["66N", "rev", 66, "Apocalypse", "Revelation"],
];

const BY_LTR = new Map(CANON.map(([ltr, code, sort, fr]) => [ltr, { code, sort, titleFr: fr }]));
const BY_EN = new Map(CANON.map(([, code, sort, fr, en]) => [en.toLowerCase(), { code, sort, titleFr: fr, titleEn: en }]));

/** Noms scrollmapper KJV (chiffres romains, variantes). */
const EN_ALIASES = {
  "i samuel": "1 samuel",
  "ii samuel": "2 samuel",
  "i kings": "1 kings",
  "ii kings": "2 kings",
  "i chronicles": "1 chronicles",
  "ii chronicles": "2 chronicles",
  "i corinthians": "1 corinthians",
  "ii corinthians": "2 corinthians",
  "i thessalonians": "1 thessalonians",
  "ii thessalonians": "2 thessalonians",
  "i timothy": "1 timothy",
  "ii timothy": "2 timothy",
  "i peter": "1 peter",
  "ii peter": "2 peter",
  "i john": "1 john",
  "ii john": "2 john",
  "iii john": "3 john",
  "revelation of john": "revelation",
  "song of songs": "song of solomon",
};

function resolveEnglishBook(name) {
  const key = String(name).trim().toLowerCase();
  return BY_EN.get(EN_ALIASES[key] ?? key);
}

const PRESETS = {
  lsg: {
    slug: "lsg",
    title: "Louis Segond 1910",
    language: "fr",
    notes: "Domaine public — bible-hub LTR",
    load: async () => {
      console.log("Téléchargement Louis Segond 1910…");
      const text = await fetch(LSG_LTR_URL).then((r) => {
        if (!r.ok) throw new Error(`LSG HTTP ${r.status}`);
        return r.text();
      });
      return parseLtr(text);
    },
  },
  kjv: {
    slug: "kjv",
    title: "King James Version",
    language: "en",
    notes: "Domaine public — scrollmapper (texte avec notes Strong)",
    load: async () => {
      console.log("Téléchargement KJV…");
      const json = await fetch(KJV_JSON_URL).then((r) => {
        if (!r.ok) throw new Error(`KJV HTTP ${r.status}`);
        return r.json();
      });
      return parseScrollmapper(json, "en");
    },
  },
};

function parseEnvLocal(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function parseLtr(text) {
  const rows = [];
  for (const line of text.trim().split(/\r?\n/)) {
    const parts = line.split("||");
    if (parts.length < 4) continue;
    const [ltr, chStr, vStr, ...bodyParts] = parts;
    const meta = BY_LTR.get(ltr);
    if (!meta) continue;
    const chapter = Number(chStr);
    const verse = Number(vStr);
    const body_text = bodyParts.join("||").trim();
    if (!chapter || !verse || !body_text) continue;
    rows.push({
      book_code: meta.code,
      book_title: meta.titleFr,
      book_sort: meta.sort,
      chapter,
      verse,
      body_text,
    });
  }
  return rows;
}

function parseScrollmapper(json, lang) {
  const rows = [];
  for (const book of json.books ?? []) {
    const meta = resolveEnglishBook(book.name);
    if (!meta) {
      console.warn("  Livre ignoré :", book.name);
      continue;
    }
    const title = lang === "fr" ? meta.titleFr : meta.titleEn;
    book.chapters?.forEach((ch, chIndex) => {
      const chapter = ch.chapter ?? chIndex + 1;
      const seen = new Set();
      for (const v of ch.verses ?? []) {
        if (seen.has(v.verse)) continue;
        seen.add(v.verse);
        const body_text = String(v.text ?? "").trim();
        if (!body_text) continue;
        rows.push({
          book_code: meta.code,
          book_title: title,
          book_sort: meta.sort,
          chapter: Number(chapter),
          verse: Number(v.verse),
          body_text,
        });
      }
    });
  }
  return rows;
}

async function upsertVersion(admin, preset) {
  const { data, error } = await admin
    .from("bible_versions")
    .upsert(
      {
        slug: preset.slug,
        title: preset.title,
        language: preset.language,
        notes: preset.notes,
      },
      { onConflict: "slug" },
    )
    .select("id, slug")
    .single();

  if (error) throw new Error(`Version ${preset.slug}: ${error.message}`);
  return data.id;
}

async function clearVerses(admin, versionId) {
  const { error, count } = await admin
    .from("bible_verses")
    .delete({ count: "exact" })
    .eq("version_id", versionId);

  if (error) throw new Error(`Suppression versets: ${error.message}`);
  console.log(`  Anciens versets supprimés : ${count ?? "?"}`);
}

async function insertVerses(admin, versionId, rows) {
  const BATCH = 400;
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH).map((r) => ({
      version_id: versionId,
      book_code: r.book_code,
      book_title: r.book_title,
      book_sort: r.book_sort,
      chapter: r.chapter,
      verse: r.verse,
      body_text: r.body_text,
    }));
    const { error } = await admin.from("bible_verses").upsert(chunk, {
      onConflict: "version_id,book_code,chapter,verse",
    });
    if (error) throw new Error(`Insert batch ${i}: ${error.message}`);
    done += chunk.length;
    process.stdout.write(`\r  Versets importés : ${done} / ${rows.length}`);
  }
  process.stdout.write("\n");
}

async function importPreset(admin, key) {
  const preset = PRESETS[key];
  if (!preset) throw new Error(`Preset inconnu: ${key}`);

  console.log(`\n=== ${preset.title} (${preset.slug}) ===`);
  const rows = await preset.load();
  console.log(`  ${rows.length} versets parsés`);

  const versionId = await upsertVersion(admin, preset);
  await clearVerses(admin, versionId);
  await insertVerses(admin, versionId, rows);
  console.log(`  Terminé : ${preset.slug}`);
}

function parseArgs() {
  const idx = process.argv.indexOf("--preset");
  const preset = idx >= 0 ? process.argv[idx + 1] : "all";
  return preset === "all" ? ["lsg", "kjv"] : [preset];
}

const env = parseEnvLocal(path.join(ROOT, ".env.local"));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans .env.local");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const presets = parseArgs();
for (const p of presets) {
  if (!PRESETS[p]) {
    console.error(`Preset invalide: ${p}. Utilisez: lsg, kjv, all`);
    process.exit(1);
  }
}

for (const p of presets) {
  await importPreset(admin, p);
}

console.log("\nImport terminé. Testez : /bible-strong/v/lsg");
