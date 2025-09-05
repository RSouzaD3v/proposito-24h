// scripts/setup-pdfjs.mjs
import { createRequire } from "module";
import fs from "fs/promises";
import path from "path";
import url from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// destinos
const projectRoot = path.resolve(__dirname, "..");
const dest = path.join(projectRoot, "public", "pdfjs");

// origens no pacote
const pdfjsPkgDir = path.dirname(require.resolve("pdfjs-dist/package.json"));
const srcs = [
  ["build", "build"],
  ["cmaps", "cmaps"],
  ["standard_fonts", "standard_fonts"],
];

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const items = await fs.readdir(src, { withFileTypes: true });
  for (const it of items) {
    const s = path.join(src, it.name);
    const d = path.join(dst, it.name);
    if (it.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

(async () => {
  await fs.rm(dest, { recursive: true, force: true });
  for (const [from, to] of srcs) {
    try {
      await copyDir(path.join(pdfjsPkgDir, from), path.join(dest, to));
    } catch {
      // algumas distros podem não incluir todos; segue o baile
    }
  }
  console.log("✔ Copiado pdfjs-dist → /public/pdfjs (build, cmaps, standard_fonts)");
})();
