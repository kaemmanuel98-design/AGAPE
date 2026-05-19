/** Canon protestant (66 livres) — codes stables pour `book_code` en base. */
export type BibleCanonBook = {
  sort: number;
  code: string;
  titleFr: string;
  titleEn: string;
  /** Code livre format bible-hub LTR (ex. `01O`, `43N`). */
  ltrCode: string;
};

export const BIBLE_CANON: BibleCanonBook[] = [
  { sort: 1, code: "gen", titleFr: "Genèse", titleEn: "Genesis", ltrCode: "01O" },
  { sort: 2, code: "exo", titleFr: "Exode", titleEn: "Exodus", ltrCode: "02O" },
  { sort: 3, code: "lev", titleFr: "Lévitique", titleEn: "Leviticus", ltrCode: "03O" },
  { sort: 4, code: "num", titleFr: "Nombres", titleEn: "Numbers", ltrCode: "04O" },
  { sort: 5, code: "deu", titleFr: "Deutéronome", titleEn: "Deuteronomy", ltrCode: "05O" },
  { sort: 6, code: "jos", titleFr: "Josué", titleEn: "Joshua", ltrCode: "06O" },
  { sort: 7, code: "jdg", titleFr: "Juges", titleEn: "Judges", ltrCode: "07O" },
  { sort: 8, code: "rut", titleFr: "Ruth", titleEn: "Ruth", ltrCode: "08O" },
  { sort: 9, code: "1sa", titleFr: "1 Samuel", titleEn: "1 Samuel", ltrCode: "09O" },
  { sort: 10, code: "2sa", titleFr: "2 Samuel", titleEn: "2 Samuel", ltrCode: "10O" },
  { sort: 11, code: "1ki", titleFr: "1 Rois", titleEn: "1 Kings", ltrCode: "11O" },
  { sort: 12, code: "2ki", titleFr: "2 Rois", titleEn: "2 Kings", ltrCode: "12O" },
  { sort: 13, code: "1ch", titleFr: "1 Chroniques", titleEn: "1 Chronicles", ltrCode: "13O" },
  { sort: 14, code: "2ch", titleFr: "2 Chroniques", titleEn: "2 Chronicles", ltrCode: "14O" },
  { sort: 15, code: "ezr", titleFr: "Esdras", titleEn: "Ezra", ltrCode: "15O" },
  { sort: 16, code: "neh", titleFr: "Néhémie", titleEn: "Nehemiah", ltrCode: "16O" },
  { sort: 17, code: "est", titleFr: "Esther", titleEn: "Esther", ltrCode: "17O" },
  { sort: 18, code: "job", titleFr: "Job", titleEn: "Job", ltrCode: "18O" },
  { sort: 19, code: "psa", titleFr: "Psaumes", titleEn: "Psalms", ltrCode: "19O" },
  { sort: 20, code: "pro", titleFr: "Proverbes", titleEn: "Proverbs", ltrCode: "20O" },
  { sort: 21, code: "ecc", titleFr: "Ecclésiaste", titleEn: "Ecclesiastes", ltrCode: "21O" },
  { sort: 22, code: "sng", titleFr: "Cantique des cantiques", titleEn: "Song of Solomon", ltrCode: "22O" },
  { sort: 23, code: "isa", titleFr: "Ésaïe", titleEn: "Isaiah", ltrCode: "23O" },
  { sort: 24, code: "jer", titleFr: "Jérémie", titleEn: "Jeremiah", ltrCode: "24O" },
  { sort: 25, code: "lam", titleFr: "Lamentations", titleEn: "Lamentations", ltrCode: "25O" },
  { sort: 26, code: "ezk", titleFr: "Ézéchiel", titleEn: "Ezekiel", ltrCode: "26O" },
  { sort: 27, code: "dan", titleFr: "Daniel", titleEn: "Daniel", ltrCode: "27O" },
  { sort: 28, code: "hos", titleFr: "Osée", titleEn: "Hosea", ltrCode: "28O" },
  { sort: 29, code: "jol", titleFr: "Joël", titleEn: "Joel", ltrCode: "29O" },
  { sort: 30, code: "amo", titleFr: "Amos", titleEn: "Amos", ltrCode: "30O" },
  { sort: 31, code: "oba", titleFr: "Abdias", titleEn: "Obadiah", ltrCode: "31O" },
  { sort: 32, code: "jon", titleFr: "Jonas", titleEn: "Jonah", ltrCode: "32O" },
  { sort: 33, code: "mic", titleFr: "Michée", titleEn: "Micah", ltrCode: "33O" },
  { sort: 34, code: "nah", titleFr: "Nahum", titleEn: "Nahum", ltrCode: "34O" },
  { sort: 35, code: "hab", titleFr: "Habakuk", titleEn: "Habakkuk", ltrCode: "35O" },
  { sort: 36, code: "zep", titleFr: "Sophonie", titleEn: "Zephaniah", ltrCode: "36O" },
  { sort: 37, code: "hag", titleFr: "Aggée", titleEn: "Haggai", ltrCode: "37O" },
  { sort: 38, code: "zec", titleFr: "Zacharie", titleEn: "Zechariah", ltrCode: "38O" },
  { sort: 39, code: "mal", titleFr: "Malachie", titleEn: "Malachi", ltrCode: "39O" },
  { sort: 40, code: "mat", titleFr: "Matthieu", titleEn: "Matthew", ltrCode: "40N" },
  { sort: 41, code: "mrk", titleFr: "Marc", titleEn: "Mark", ltrCode: "41N" },
  { sort: 42, code: "luk", titleFr: "Luc", titleEn: "Luke", ltrCode: "42N" },
  { sort: 43, code: "jhn", titleFr: "Jean", titleEn: "John", ltrCode: "43N" },
  { sort: 44, code: "act", titleFr: "Actes", titleEn: "Acts", ltrCode: "44N" },
  { sort: 45, code: "rom", titleFr: "Romains", titleEn: "Romans", ltrCode: "45N" },
  { sort: 46, code: "1co", titleFr: "1 Corinthiens", titleEn: "1 Corinthians", ltrCode: "46N" },
  { sort: 47, code: "2co", titleFr: "2 Corinthiens", titleEn: "2 Corinthians", ltrCode: "47N" },
  { sort: 48, code: "gal", titleFr: "Galates", titleEn: "Galatians", ltrCode: "48N" },
  { sort: 49, code: "eph", titleFr: "Éphésiens", titleEn: "Ephesians", ltrCode: "49N" },
  { sort: 50, code: "php", titleFr: "Philippiens", titleEn: "Philippians", ltrCode: "50N" },
  { sort: 51, code: "col", titleFr: "Colossiens", titleEn: "Colossians", ltrCode: "51N" },
  { sort: 52, code: "1th", titleFr: "1 Thessaloniciens", titleEn: "1 Thessalonians", ltrCode: "52N" },
  { sort: 53, code: "2th", titleFr: "2 Thessaloniciens", titleEn: "2 Thessalonians", ltrCode: "53N" },
  { sort: 54, code: "1ti", titleFr: "1 Timothée", titleEn: "1 Timothy", ltrCode: "54N" },
  { sort: 55, code: "2ti", titleFr: "2 Timothée", titleEn: "2 Timothy", ltrCode: "55N" },
  { sort: 56, code: "tit", titleFr: "Tite", titleEn: "Titus", ltrCode: "56N" },
  { sort: 57, code: "phm", titleFr: "Philémon", titleEn: "Philemon", ltrCode: "57N" },
  { sort: 58, code: "heb", titleFr: "Hébreux", titleEn: "Hebrews", ltrCode: "58N" },
  { sort: 59, code: "jas", titleFr: "Jacques", titleEn: "James", ltrCode: "59N" },
  { sort: 60, code: "1pe", titleFr: "1 Pierre", titleEn: "1 Peter", ltrCode: "60N" },
  { sort: 61, code: "2pe", titleFr: "2 Pierre", titleEn: "2 Peter", ltrCode: "61N" },
  { sort: 62, code: "1jn", titleFr: "1 Jean", titleEn: "1 John", ltrCode: "62N" },
  { sort: 63, code: "2jn", titleFr: "2 Jean", titleEn: "2 John", ltrCode: "63N" },
  { sort: 64, code: "3jn", titleFr: "3 Jean", titleEn: "3 John", ltrCode: "64N" },
  { sort: 65, code: "jud", titleFr: "Jude", titleEn: "Jude", ltrCode: "65N" },
  { sort: 66, code: "rev", titleFr: "Apocalypse", titleEn: "Revelation", ltrCode: "66N" },
];

const ltrMap = new Map(BIBLE_CANON.map((b) => [b.ltrCode, b]));
const enNameMap = new Map(BIBLE_CANON.map((b) => [b.titleEn.toLowerCase(), b]));

export function bookFromLtrCode(ltrCode: string): BibleCanonBook | undefined {
  return ltrMap.get(ltrCode);
}

export function bookFromEnglishName(name: string): BibleCanonBook | undefined {
  return enNameMap.get(name.trim().toLowerCase());
}
