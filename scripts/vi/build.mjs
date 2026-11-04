import { build } from "esbuild";
import { mkdir, rm, copyFile, cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
export async function buildWorker(outdir) {
  await mkdir(outdir, { recursive: true });
  await build({
    entryPoints: ["web/v4-worker.ts"],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    outfile: path.join(outdir, "v4-worker.js"),
    minify: true,
  });
}
if (process.argv.includes("--worker-only")) await buildWorker("public");
else {
  const out = "dist";
  await rm(out, { recursive: true, force: true });
  await mkdir(out + "/assets", { recursive: true });
  await build({
    entryPoints: { main: "web/main.tsx" },
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    outdir: out + "/assets",
    minify: true,
    define: { "process.env.NODE_ENV": '"production"' },
    external: ["/fonts/*"],
    loader: { ".ttf": "file" },
    assetNames: "[name]-[hash]",
  });
  await buildWorker(out);
  await cp("public/fonts", out + "/fonts", { recursive: true });
  await copyFile("web/index.html", out + "/index.html");
  // Relative font URL works on GitHub Pages project paths and on ordinary root hosting.
  const css = await readFile(out + "/assets/main.css", "utf8");
  await writeFile(
    out + "/assets/main.css",
    css
      .replaceAll("url(/fonts/Report.ttf)", "url(../fonts/Report.ttf)")
      .replaceAll('url("/fonts/Report.ttf")', 'url("../fonts/Report.ttf")'),
  );
  await copyFile("LICENSE", out + "/LICENSE");
  await copyFile("DATASET-LICENSE", out + "/DATASET-LICENSE");
  console.log(
    "Static MVP ready at " +
      path.join(root, out) +
      " — no backend and no deployment performed.",
  );
}
