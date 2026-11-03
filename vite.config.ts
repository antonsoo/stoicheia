import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, transformWithOxc } from "vite";
import { verifiedTransfer } from "./src/core/verified-transfer";
import { offlineRecovery } from "./src/offline-recovery";

const base = "/stoicheia/";

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? filesIn(path.join(directory, entry.name))
        : Promise.resolve([path.join(directory, entry.name)]),
    ),
  );
  return nested.flat();
}

export default defineConfig(async ({ command }) => {
  const inputFiles = [
    ...(await filesIn("src")),
    ...(await filesIn("public")),
    "index.html",
    "triangle.html",
    "quadrature.html",
    "gnomon.html",
    "mesolabe.html",
    "desk.html",
    "measure.html",
    "circle.html",
    "horn.html",
    "quadratrix.html",
    "ratios.html",
    "solids.html",
    "primes.html",
    "areas.html",
    "LICENSE",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.worker.json",
    "package.json",
    "package-lock.json",
  ].sort();
  const inputHash = createHash("sha256");
  for (const file of inputFiles) {
    inputHash.update(file);
    inputHash.update(await readFile(file));
  }
  const edition = command === "build" ? inputHash.digest("hex") : "development";
  const studyFiles: Record<string, { bytes: number; sha256: string }> = {};
  for (const manifest of [
    "public/sources/manifest.json",
    "public/sources/mesolabe/manifest.json",
    "public/sources/measure/manifest.json",
    "public/sources/circle/manifest.json",
    "public/sources/horn/manifest.json",
    "public/sources/quadratrix/manifest.json",
    "public/sources/ratios/manifest.json",
    "public/sources/solids/manifest.json",
    "public/sources/primes/manifest.json",
    "public/sources/areas/manifest.json",
  ]) {
    const sourceManifest = JSON.parse(await readFile(manifest, "utf8")) as {
      pages: { file: string; bytes: number; sha256: string }[];
    };
    for (const page of sourceManifest.pages) {
      const file = `sources/${page.file}`;
      const bytes = await readFile(`public/${file}`);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (bytes.length !== page.bytes || sha256 !== page.sha256)
        throw new Error(
          `Source manifest does not match ${file}. Review the source identity before building.`,
        );
      studyFiles[file] = { bytes: bytes.length, sha256 };
    }
  }
  for (const file of [
    "fonts/NotoSerif-Regular.ttf",
    "fonts/OFL.txt",
    "sources/primes/manifest.json",
    "sources/areas/manifest.json",
  ]) {
    const bytes = await readFile(`public/${file}`);
    studyFiles[file] = {
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }
  return {
    base,
    build: {
      rollupOptions: {
        input: {
          reader: "index.html",
          triangle: "triangle.html",
          quadrature: "quadrature.html",
          gnomon: "gnomon.html",
          mesolabe: "mesolabe.html",
          desk: "desk.html",
          measure: "measure.html",
          circle: "circle.html",
          horn: "horn.html",
          quadratrix: "quadratrix.html",
          ratios: "ratios.html",
          solids: "solids.html",
          primes: "primes.html",
          areas: "areas.html",
        },
      },
    },
    define: {
      __STOICHEIA_EDITION__: JSON.stringify(edition),
      __STOICHEIA_STUDY_FILES__: JSON.stringify(studyFiles),
    },
    plugins: [
      {
        name: "edition-navigation-mark",
        transformIndexHtml() {
          return [
            {
              tag: "meta",
              attrs: { name: "stoicheia-edition", content: edition },
              injectTo: "head",
            },
          ];
        },
      },
      {
        name: "offline-book",
        apply: "build",
        async closeBundle() {
          const files = (await filesIn("dist")).filter((f) => !f.endsWith("sw.js")).sort();
          const urls = files.map(
            (file) => base + path.relative("dist", file).split(path.sep).join("/"),
          );
          const identities = Object.fromEntries(
            await Promise.all(
              files.map(async (file, index) => {
                const bytes = await readFile(file);
                return [
                  urls[index],
                  { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") },
                ];
              }),
            ),
          );
          const recoveryScript = `(${offlineRecovery.toString()})(${JSON.stringify(edition)},${JSON.stringify(base)});`;
          const recoveryStyle =
            "body{margin:0;padding:clamp(20px,6vw,80px);max-width:850px;background:#e8eff4;color:#193d60;font:17px/1.6 system-ui,sans-serif}h1{font:clamp(28px,5vw,42px) Georgia,serif}button,a{color:inherit}button{font:inherit;padding:12px;border:1px solid #193d60;background:#fbfcfe;cursor:pointer}button:disabled{opacity:.5}button:focus-visible,a:focus-visible{outline:3px solid #694780;outline-offset:4px}code{display:block;overflow-wrap:anywhere;font-size:14px}p{max-width:70ch}summary{cursor:pointer;padding:12px 0;min-height:44px}";
          const scriptHash = createHash("sha256").update(recoveryScript).digest("base64");
          const styleHash = createHash("sha256").update(recoveryStyle).digest("base64");
          const recovery = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${scriptHash}'; style-src 'sha256-${styleHash}'; connect-src 'self'; worker-src 'self'; img-src data:; base-uri 'none'; form-action 'none'"><link rel="icon" href="data:,"><title>Stoicheia · Recover the saved reader</title><style>${recoveryStyle}</style><main><p>STOICHEIA · SAVED READER</p><h1>This lesson’s saved files are incomplete.</h1><p>The reader could not open from its saved copy. Your lesson address and applied settings remain below. Reconnect, repair the files, then return to the same address.</p><p id="recovery-context">Your workshop and applied settings remain at this lesson’s address.</p><details><summary>Keep this lesson’s address</summary><code id="recovery-address"></code></details><p id="recovery-status" role="status">Check or repair the saved reader. No account or reset is required.</p><button id="recovery-repair" type="button">Repair the saved reader</button><p><a id="recovery-home" href="${base}">Return to the course opening</a></p><noscript>Reconnect and reload this address to restore the reader.</noscript></main><script>${recoveryScript}</script></html>`;
          const worker = await transformWithOxc(
            await readFile("src/offline-worker.ts", "utf8"),
            "offline-worker.ts",
          );
          await writeFile(
            "dist/sw.js",
            `/* Offline edition ${edition}. Generated from the complete build. */
const CACHE = "stoicheia-${edition}";
const EDITION = ${JSON.stringify(edition)};
const BASE = ${JSON.stringify(base)};
const FILES = ${JSON.stringify(urls)};
const IDENTITIES = ${JSON.stringify(identities)};
const RECOVERY_HTML = ${JSON.stringify(recovery)};
const transfer = ${verifiedTransfer.toString()};
${worker.code}
`,
          );
        },
      },
    ],
  };
});
