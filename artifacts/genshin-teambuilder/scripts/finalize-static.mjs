import { copyFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Static-host finalizer: GitHub Pages and similar hosts need
//   1. A 404.html that mirrors index.html so any unknown path falls back
//      to the SPA (e.g. when a user reloads on a hashless URL).
//   2. An empty .nojekyll so GitHub Pages doesn't strip files starting with _.
const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist", "public");

if (!existsSync(distDir)) {
  console.error(`finalize-static: dist directory not found at ${distDir}`);
  process.exit(1);
}

const indexPath = resolve(distDir, "index.html");
const fallbackPath = resolve(distDir, "404.html");
const nojekyllPath = resolve(distDir, ".nojekyll");

if (!existsSync(indexPath)) {
  console.error(`finalize-static: index.html missing at ${indexPath}`);
  process.exit(1);
}

copyFileSync(indexPath, fallbackPath);
writeFileSync(nojekyllPath, "");

console.log("finalize-static: wrote 404.html and .nojekyll");
