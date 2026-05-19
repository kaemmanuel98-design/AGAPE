import { extractFirstCsvFromZip } from "./extract-zip-csv.mjs";

const SG1910_ZIP = "https://concordance.bible/media/download/Sg1910-csv.zip";

const OSIS_TO_CODE = {
  Gen: ["gen", 1, "Genèse"],
  Exod: ["exo", 2, "Exode"],
  Lev: ["lev", 3, "Lévitique"],
  Num: ["num", 4, "Nombres"],
  Deut: ["deu", 5, "Deutéronome"],
  Josh: ["jos", 6, "Josué"],
  Judg: ["jdg", 7, "Juges"],
  Ruth: ["rut", 8, "Ruth"],
  "1Sam": ["1sa", 9, "1 Samuel"],
  "2Sam": ["2sa", 10, "2 Samuel"],
  "1Kgs": ["1ki", 11, "1 Rois"],
  "2Kgs": ["2ki", 12, "2 Rois"],
  "1Chr": ["1ch", 13, "1 Chroniques"],
  "2Chr": ["2ch", 14, "2 Chroniques"],
  Ezra: ["ezr", 15, "Esdras"],
  Neh: ["neh", 16, "Néhémie"],
  Esth: ["est", 17, "Esther"],
  Job: ["job", 18, "Job"],
  Ps: ["psa", 19, "Psaumes"],
  Prov: ["pro", 20, "Proverbes"],
  Eccl: ["ecc", 21, "Ecclésiaste"],
  Song: ["sng", 22, "Cantique des cantiques"],
  Isa: ["isa", 23, "Ésaïe"],
  Jer: ["jer", 24, "Jérémie"],
  Lam: ["lam", 25, "Lamentations"],
  Ezek: ["ezk", 26, "Ézéchiel"],
  Dan: ["dan", 27, "Daniel"],
  Hos: ["hos", 28, "Osée"],
  Joel: ["jol", 29, "Joël"],
  Amos: ["amo", 30, "Amos"],
  Obad: ["oba", 31, "Abdias"],
  Jonah: ["jon", 32, "Jonas"],
  Mic: ["mic", 33, "Michée"],
  Nah: ["nah", 34, "Nahum"],
  Hab: ["hab", 35, "Habakuk"],
  Zeph: ["zep", 36, "Sophonie"],
  Hag: ["hag", 37, "Aggée"],
  Zech: ["zec", 38, "Zacharie"],
  Mal: ["mal", 39, "Malachie"],
  Matt: ["mat", 40, "Matthieu"],
  Mark: ["mrk", 41, "Marc"],
  Luke: ["luk", 42, "Luc"],
  John: ["jhn", 43, "Jean"],
  Acts: ["act", 44, "Actes"],
  Rom: ["rom", 45, "Romains"],
  "1Cor": ["1co", 46, "1 Corinthiens"],
  "2Cor": ["2co", 47, "2 Corinthiens"],
  Gal: ["gal", 48, "Galates"],
  Eph: ["eph", 49, "Éphésiens"],
  Phil: ["php", 50, "Philippiens"],
  Col: ["col", 51, "Colossiens"],
  "1Thess": ["1th", 52, "1 Thessaloniciens"],
  "2Thess": ["2th", 53, "2 Thessaloniciens"],
  "1Tim": ["1ti", 54, "1 Timothée"],
  "2Tim": ["2ti", 55, "2 Timothée"],
  Titus: ["tit", 56, "Tite"],
  Phlm: ["phm", 57, "Philémon"],
  Heb: ["heb", 58, "Hébreux"],
  Jas: ["jas", 59, "Jacques"],
  "1Pet": ["1pe", 60, "1 Pierre"],
  "2Pet": ["2pe", 61, "2 Pierre"],
  "1John": ["1jn", 62, "1 Jean"],
  "2John": ["2jn", 63, "2 Jean"],
  "3John": ["3jn", 64, "3 Jean"],
  Jude: ["jud", 65, "Jude"],
  Rev: ["rev", 66, "Apocalypse"],
};

function normalizeStrongCode(raw) {
  const m = String(raw).trim().toUpperCase().match(/^([GH])0*(\d+)$/);
  return m ? `${m[1]}${m[2]}` : null;
}

function sg1910XmlToInline(text) {
  let out = text.replace(/<w strong="([GH]0*\d+)">([^<]*)<\/w>/gi, (_, rawCode, word) => {
    const code = normalizeStrongCode(rawCode);
    if (!code) return word;
    const w = word.trim();
    return w ? `${w}[${code}]` : "";
  });
  out = out.replace(/<[^>]+>/g, "");
  return out.replace(/\s+/g, " ").trim();
}

/** Segond 1910 + numéros Strong (concordance.bible). */
export async function loadSg1910Rows() {
  console.log("Téléchargement Segond 1910 + Strong (ZIP)…");
  const res = await fetch(SG1910_ZIP);
  if (!res.ok) throw new Error(`Sg1910 HTTP ${res.status}`);
  const csv = extractFirstCsvFromZip(Buffer.from(await res.arrayBuffer()));
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length < 4) continue;
    const bookId = cols[0];
    const chapter = Number(cols[1]);
    const verse = Number(cols[2]);
    const xml = cols.slice(3).join("\t");
    const meta = OSIS_TO_CODE[bookId];
    if (!meta) {
      console.warn("  Livre OSIS ignoré :", bookId);
      continue;
    }
    const [book_code, book_sort, book_title] = meta;
    const body_text = sg1910XmlToInline(xml);
    if (!chapter || !verse || !body_text) continue;
    rows.push({ book_code, book_title, book_sort, chapter, verse, body_text });
  }
  return rows;
}
