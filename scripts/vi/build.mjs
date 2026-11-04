import { build } from "esbuild";
import { mkdir, rm, copyFile, cp, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
export async function buildWorker(outdir) {
  await mkdir(outdir, { recursive: true });
  return await build({
    entryPoints: ["web/v4-worker.ts"],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    outfile: path.join(outdir, "v4-worker.js"),
    metafile: true,
    minify: true,
  });
}
if (process.argv.includes("--worker-only")) await buildWorker("public");
else {
  const out = "dist";
  await rm(out, { recursive: true, force: true });
  await mkdir(out + "/assets", { recursive: true });
  const client = await build({
    entryPoints: { main: "web/main.tsx" },
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    outdir: out + "/assets",
    metafile: true,
    minify: true,
    define: { "process.env.NODE_ENV": '"production"' },
    external: ["/fonts/*"],
    loader: { ".ttf": "file" },
    assetNames: "[name]-[hash]",
  });
  const worker = await buildWorker(out);
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
  // Retain the licenses of actual bundled packages, including lazy PDF dependencies.
  const packageDirs = new Set();
  for (const input of [...Object.keys(client.metafile.inputs), ...Object.keys(worker.metafile.inputs)]) {
    const start = input.lastIndexOf("node_modules/");
    if (start < 0) continue;
    const tail = input.slice(start + 13).split("/");
    const name = tail[0].startsWith("@") ? tail.slice(0, 2).join("/") : tail[0];
    packageDirs.add(input.slice(0, start + 13) + name);
  }
  const notices = ["Third-party software distributed with this static website.\n"];
  for (const dir of [...packageDirs].sort()) {
    const pkg = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
    notices.push(`\n=== ${pkg.name} ${pkg.version} (${pkg.license ?? "see license"}) ===\n`);
    const files = (await readdir(dir, { withFileTypes: true })).filter(f => f.isFile() && /^(license|licence|copying|notice|copyright)([._-]|$)/i.test(f.name));
    if (!files.length) throw new Error("Missing bundled package license: " + dir);
    for (const file of files) notices.push(await readFile(path.join(dir, file.name), "utf8"));
  }
  notices.push("\n=== Zstandard 1.5.7 compiled inside WASM (BSD) ===\n" + await readFile("content/licenses/zstd-BSD.txt", "utf8"));
  await writeFile(path.join(out, "THIRD-PARTY-NOTICES.txt"), notices.join("\n"));
  console.log(
    "Static MVP ready at " +
      path.join(root, out) +
      " — no backend and no deployment performed.",
  );
}
