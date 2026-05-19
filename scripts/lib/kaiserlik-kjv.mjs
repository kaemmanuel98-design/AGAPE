const KAISERLIK_BASE = "https://raw.githubusercontent.com/kaiserlik/kjv/master";

export const BOOK_FILE = {
  Gen: ["gen", 1, "Genesis"],
  Exo: ["exo", 2, "Exodus"],
  Lev: ["lev", 3, "Leviticus"],
  Num: ["num", 4, "Numbers"],
  Deu: ["deu", 5, "Deuteronomy"],
  Jos: ["jos", 6, "Joshua"],
  Jdg: ["jdg", 7, "Judges"],
  Rth: ["rut", 8, "Ruth"],
  "1Sa": ["1sa", 9, "1 Samuel"],
  "2Sa": ["2sa", 10, "2 Samuel"],
  "1Ki": ["1ki", 11, "1 Kings"],
  "2Ki": ["2ki", 12, "2 Kings"],
  "1Ch": ["1ch", 13, "1 Chronicles"],
  "2Ch": ["2ch", 14, "2 Chronicles"],
  Ezr: ["ezr", 15, "Ezra"],
  Neh: ["neh", 16, "Nehemiah"],
  Est: ["est", 17, "Esther"],
  Job: ["job", 18, "Job"],
  Psa: ["psa", 19, "Psalms"],
  Pro: ["pro", 20, "Proverbs"],
  Ecc: ["ecc", 21, "Ecclesiastes"],
  Sng: ["sng", 22, "Song of Solomon"],
  Isa: ["isa", 23, "Isaiah"],
  Jer: ["jer", 24, "Jeremiah"],
  Lam: ["lam", 25, "Lamentations"],
  Eze: ["ezk", 26, "Ezekiel"],
  Dan: ["dan", 27, "Daniel"],
  Hos: ["hos", 28, "Hosea"],
  Joe: ["jol", 29, "Joel"],
  Amo: ["amo", 30, "Amos"],
  Oba: ["oba", 31, "Obadiah"],
  Jon: ["jon", 32, "Jonah"],
  Mic: ["mic", 33, "Micah"],
  Nah: ["nah", 34, "Nahum"],
  Hab: ["hab", 35, "Habakkuk"],
  Zep: ["zep", 36, "Zephaniah"],
  Hag: ["hag", 37, "Haggai"],
  Zec: ["zec", 38, "Zechariah"],
  Mal: ["mal", 39, "Malachi"],
  Mat: ["mat", 40, "Matthew"],
  Mar: ["mrk", 41, "Mark"],
  Luk: ["luk", 42, "Luke"],
  Jhn: ["jhn", 43, "John"],
  Act: ["act", 44, "Acts"],
  Rom: ["rom", 45, "Romans"],
  "1Co": ["1co", 46, "1 Corinthians"],
  "2Co": ["2co", 47, "2 Corinthians"],
  Gal: ["gal", 48, "Galatians"],
  Eph: ["eph", 49, "Ephesians"],
  Phl: ["php", 50, "Philippians"],
  Col: ["col", 51, "Colossians"],
  "1Th": ["1th", 52, "1 Thessalonians"],
  "2Th": ["2th", 53, "2 Thessalonians"],
  "1Ti": ["1ti", 54, "1 Timothy"],
  "2Ti": ["2ti", 55, "2 Timothy"],
  Tit: ["tit", 56, "Titus"],
  Phm: ["phm", 57, "Philemon"],
  Heb: ["heb", 58, "Hebrews"],
  Jas: ["jas", 59, "James"],
  "1Pe": ["1pe", 60, "1 Peter"],
  "2Pe": ["2pe", 61, "2 Peter"],
  "1Jo": ["1jn", 62, "1 John"],
  "2Jo": ["2jn", 63, "2 John"],
  "3Jo": ["3jn", 64, "3 John"],
  Jde: ["jud", 65, "Jude"],
  Rev: ["rev", 66, "Revelation"],
};

function stripHtml(text) {
  return text.replace(/<\/?(?:em|i|b|strong|span)[^>]*>/gi, "");
}

function readQuotedString(raw, openQuoteIndex) {
  let out = "";
  for (let i = openQuoteIndex + 1; i < raw.length; i++) {
    const c = raw[i];
    if (c === "\\") {
      out += raw[++i] ?? "";
      continue;
    }
    if (c === '"') return { value: out, end: i };
    out += c;
  }
  return { value: out, end: raw.length };
}

function parseBookRaw(raw, bookFile, meta) {
  const [code, sort, titleEn] = meta;
  const rowsMap = new Map();
  const fileEsc = bookFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const verseRe = new RegExp(`(?:^|[,{])\\s*"${fileEsc}\\|(\\d+)\\|(\\d+)"\\s*:\\s*\\{`, "gm");
  let m;

  while ((m = verseRe.exec(raw)) !== null) {
    const chapter = Number(m[1]);
    const verse = Number(m[2]);
    const slice = raw.slice(m.index, m.index + 800);
    const enMatch = slice.match(/"en"\s*:\s*"/);
    if (!enMatch || enMatch.index === undefined) continue;
    const quoteIndex = m.index + enMatch.index + enMatch[0].length - 1;
    const { value } = readQuotedString(raw, quoteIndex);
    const body = stripHtml(value.trim());
    if (!chapter || !verse || !body) continue;
    rowsMap.set(`${chapter}:${verse}`, {
      book_code: code,
      book_title: titleEn,
      book_sort: sort,
      chapter,
      verse,
      body_text: body,
    });
  }
  return [...rowsMap.values()];
}

/** Charge tous les versets KJV + Strong (kaiserlik). */
export async function loadKaiserlikKjvRows() {
  let all = [];
  for (const [file, meta] of Object.entries(BOOK_FILE)) {
    process.stdout.write(`\r  kaiserlik ${file}…`);
    const res = await fetch(`${KAISERLIK_BASE}/${file}.json`);
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    const raw = await res.text();
    all = all.concat(parseBookRaw(raw, file, meta));
  }
  process.stdout.write("\n");
  return all;
}
