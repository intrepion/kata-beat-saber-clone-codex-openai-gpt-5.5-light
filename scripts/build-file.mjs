import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

await mkdir(root, { recursive: true });

await esbuild.build({
  entryPoints: [resolve(root, "src/main.ts")],
  outfile: resolve(root, "game.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  loader: {
    ".css": "css"
  }
});

const bundledCss = await readFile(resolve(root, "game.css"), "utf8").catch(() => "");
const sourceCss = await readFile(resolve(root, "src/style.css"), "utf8");

if (!bundledCss.includes(".game-shell")) {
  await writeFile(resolve(root, "game.css"), sourceCss);
}
