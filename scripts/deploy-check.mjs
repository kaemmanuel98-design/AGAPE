import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const requiredFiles = [
  "public/manifest.json",
  "app/[locale]/layout.tsx",
];

const alternativeLogoFiles = [
  "public/agape-logo-final.png",
  "public/agape-logo-final.png.png",
];

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

let hasError = false;

console.log("Agape deployment check\n");

for (const relativePath of requiredFiles) {
  const ok = await exists(relativePath);
  console.log(`${ok ? "OK" : "MISSING"}  ${relativePath}`);
  if (!ok) {
    hasError = true;
  }
}

const logoFound =
  (await Promise.all(alternativeLogoFiles.map((relativePath) => exists(relativePath)))).some(
    Boolean,
  );

console.log(`${logoFound ? "OK" : "MISSING"}  public/agape-logo-final.png (or .png.png fallback)`);

if (!logoFound) {
  hasError = true;
}

console.log("\nRequired environment variables for Vercel:");
console.log("- NEXT_PUBLIC_SUPABASE_URL");
console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY");
console.log("- NEXT_PUBLIC_SITE_URL (recommended in production)");

console.log("\nRecommended deployment flow:");
console.log("1. Fork the repository on GitHub");
console.log("2. Import the fork into Vercel");
console.log("3. Add the environment variables");
console.log("4. Run the Supabase migrations");
console.log("5. Deploy and install the PWA from Safari/Chrome");

if (hasError) {
  console.error("\nDeployment check failed: one or more required files are missing.");
  process.exit(1);
}

console.log("\nDeployment check passed.");
