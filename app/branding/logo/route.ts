import { access, readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const CANDIDATE_LOGOS = [
  path.join(process.cwd(), "public", "agape-logo-final.png"),
  path.join(process.cwd(), "public", "agape-logo-final.png.png"),
];

async function resolveLogoPath() {
  for (const candidate of CANDIDATE_LOGOS) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

export async function GET() {
  const logoPath = await resolveLogoPath();

  if (!logoPath) {
    return new Response("Logo not found", { status: 404 });
  }

  const file = await readFile(logoPath);

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
