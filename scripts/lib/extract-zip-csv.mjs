import { inflateRawSync } from "node:zlib";

/**
 * Extrait le premier fichier .csv d’un ZIP (méthode deflate ou stockage).
 * @param {Buffer} buffer
 * @returns {string}
 */
export function extractFirstCsvFromZip(buffer) {
  let offset = 0;
  while (offset + 30 < buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break;

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compSize = buffer.readUInt32LE(offset + 18);
    const nameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);
    const name = buffer.toString("utf8", offset + 30, offset + 30 + nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    const compressed = buffer.subarray(dataStart, dataStart + compSize);
    offset = dataStart + compSize;

    if (!name.toLowerCase().endsWith(".csv")) continue;

    if (compressionMethod === 0) return compressed.toString("utf8");
    if (compressionMethod === 8) return inflateRawSync(compressed).toString("utf8");
    throw new Error(`Compression ZIP non supportée (${compressionMethod}) pour ${name}`);
  }
  throw new Error("Aucun CSV trouvé dans l’archive ZIP");
}
