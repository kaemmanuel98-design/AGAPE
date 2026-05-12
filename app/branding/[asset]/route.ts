import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

export const runtime = "nodejs";

const LOGO_PATH = path.join(process.cwd(), "public", "agape-logo-final.png");

const ICON_PRESETS: Record<
  string,
  {
    size: number;
    variant: "favicon" | "pwa" | "apple" | "maskable" | "tile";
  }
> = {
  "favicon-16x16.png": { size: 16, variant: "favicon" },
  "favicon-32x32.png": { size: 32, variant: "favicon" },
  "icon-192x192.png": { size: 192, variant: "pwa" },
  "icon-512x512.png": { size: 512, variant: "pwa" },
  "icon-maskable-512x512.png": { size: 512, variant: "maskable" },
  "apple-touch-icon.png": { size: 180, variant: "apple" },
  "mstile-150x150.png": { size: 150, variant: "tile" },
};

function getArtworkScale(variant: (typeof ICON_PRESETS)[string]["variant"]) {
  switch (variant) {
    case "favicon":
      return 0.74;
    case "maskable":
      return 0.58;
    case "apple":
      return 0.62;
    case "tile":
      return 0.64;
    default:
      return 0.66;
  }
}

function buildBaseSvg(size: number, variant: (typeof ICON_PRESETS)[string]["variant"]) {
  const shadowOpacity = variant === "apple" ? 0.2 : 0.14;
  const blur = Math.max(2, Math.round(size * (variant === "favicon" ? 0.08 : 0.05)));
  const strokeOpacity = variant === "favicon" ? 0.18 : 0.12;

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
  <rect x="0" y="0" width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#bg)" />
  <rect x="${Math.max(1, Math.round(size * 0.01))}" y="${Math.max(1, Math.round(size * 0.01))}" width="${size - Math.max(2, Math.round(size * 0.02))}" height="${size - Math.max(2, Math.round(size * 0.02))}" rx="${Math.round(size * 0.21)}" fill="none" stroke="#94A3B8" stroke-opacity="${strokeOpacity}" />
  <ellipse cx="${Math.round(size / 2)}" cy="${Math.round(size * 0.72)}" rx="${Math.round(size * 0.18)}" ry="${Math.round(size * 0.055)}" fill="#0F172A" fill-opacity="${shadowOpacity}" filter="url(#ellipse-blur)" />
</svg>`);
}

function buildFallbackLogoSvg(size: number) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.24}" fill="#2563EB" />
  <text x="50%" y="54%" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${Math.round(size * 0.28)}" font-weight="700" fill="#FFFFFF">A</text>
</svg>`);
}

async function loadLogoBuffer() {
  try {
    return await readFile(LOGO_PATH);
  } catch {
    return null;
  }
}

async function buildIcon(asset: keyof typeof ICON_PRESETS) {
  const preset = ICON_PRESETS[asset];
  const size = preset.size;
  const artworkSize = Math.round(size * getArtworkScale(preset.variant));
  const logoInput = await loadLogoBuffer();

  const logoBuffer = logoInput
    ? await sharp(logoInput)
        .resize(artworkSize, artworkSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
    : buildFallbackLogoSvg(artworkSize);

  return sharp(buildBaseSvg(size, preset.variant))
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ asset: string }> },
) {
  const { asset } = await context.params;

  if (!(asset in ICON_PRESETS)) {
    return new Response("Not found", { status: 404 });
  }

  const png = await buildIcon(asset as keyof typeof ICON_PRESETS);

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
