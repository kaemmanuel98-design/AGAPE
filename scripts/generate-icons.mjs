import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");
const logoPath = path.join(root, "public", "favicon.svg");

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

function buildBaseSvg(size) {
  const blur = Math.max(2, Math.round(size * 0.05));
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F2F6FB" />
    </linearGradient>
    <filter id="ellipse-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${blur}" />
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#bg)" />
  <rect x="${Math.max(1, Math.round(size * 0.01))}" y="${Math.max(1, Math.round(size * 0.01))}" width="${size - Math.max(2, Math.round(size * 0.02))}" height="${size - Math.max(2, Math.round(size * 0.02))}" rx="${Math.round(size * 0.21)}" fill="none" stroke="#94A3B8" stroke-opacity="0.12" />
  <ellipse cx="${Math.round(size / 2)}" cy="${Math.round(size * 0.72)}" rx="${Math.round(size * 0.18)}" ry="${Math.round(size * 0.055)}" fill="#0F172A" fill-opacity="0.16" filter="url(#ellipse-blur)" />
</svg>`);
}

function buildFallbackLogoSvg(size) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.24}" fill="#2563EB" />
  <text x="50%" y="54%" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${Math.round(size * 0.28)}" font-weight="700" fill="#FFFFFF">A</text>
</svg>`);
}

async function buildStyledIcon(size, scale = 0.66) {
  const artworkSize = Math.round(size * scale);
  let logoBuffer;

  try {
    logoBuffer = await sharp(logoPath)
      .resize(artworkSize, artworkSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  } catch {
    logoBuffer = buildFallbackLogoSvg(artworkSize);
  }

  return sharp(buildBaseSvg(size))
    .composite([
      {
        input: logoBuffer,
        left: Math.round((size - artworkSize) / 2),
        top: Math.round((size - artworkSize) / 2 - size * 0.04),
      },
    ])
    .png()
    .toBuffer();
}

await mkdir(outDir, { recursive: true });

for (const [name, size] of sizes) {
  const scale = name === "apple-touch-icon.png" ? 0.62 : 0.66;
  const buffer = await buildStyledIcon(size, scale);
  await sharp(buffer).toFile(path.join(outDir, name));
}

/** Maskable: safe zone padding for tiles / Android adaptive icons */
const mask512 = await buildStyledIcon(512, 0.58);

await sharp(mask512).toFile(path.join(outDir, "maskable-512x512.png"));

console.log(`Icons generated in ${path.relative(root, outDir)}`);
