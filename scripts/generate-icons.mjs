import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0F172A"/>
  <circle cx="256" cy="196" r="76" fill="#2563EB"/>
  <path d="M120 396 Q256 284 392 396" stroke="#2563EB" stroke-width="28" fill="none" stroke-linecap="round"/>
</svg>`;

const sizes = [
  ["icon-72x72.png", 72],
  ["icon-96x96.png", 96],
  ["icon-128x128.png", 128],
  ["icon-144x144.png", 144],
  ["icon-152x152.png", 152],
  ["icon-192x192.png", 192],
  ["icon-384x384.png", 384],
  ["icon-512x512.png", 512],
  ["apple-touch-icon.png", 180],
  ["mstile-150x150.png", 150],
];

await mkdir(outDir, { recursive: true });
const svgBuf = Buffer.from(svg);

for (const [name, size] of sizes) {
  await sharp(svgBuf).resize(size, size).png().toFile(path.join(outDir, name));
}

/** Maskable: safe zone padding for tiles / Android adaptive icons */
const mask512 = await sharp(svgBuf)
  .resize(384, 384)
  .extend({
    top: 64,
    bottom: 64,
    left: 64,
    right: 64,
    background: "#0F172A",
  })
  .png()
  .toBuffer();

await sharp(mask512).toFile(path.join(outDir, "maskable-512x512.png"));

console.log(`Icons generated in ${path.relative(root, outDir)}`);
