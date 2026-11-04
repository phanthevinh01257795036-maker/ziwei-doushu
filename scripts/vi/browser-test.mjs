import { chromium } from "playwright";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("dist");
const mime = {
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".json": "application/json",
};
const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    pathname = pathname.replace(/^\/ziwei-doushu\//, "/");
    if (pathname === "/") pathname = "/index.html";
    const file = path.resolve(root, "." + pathname);
    if (!file.startsWith(root + path.sep)) throw new Error();
    const info = await stat(file);
    if (!info.isFile()) throw new Error();
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] ?? "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/ziwei-doushu/`;
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (req) => {
    if (
      !req.url().startsWith(`http://127.0.0.1:${port}`) &&
      !req.url().startsWith("data:") &&
      !req.url().startsWith("blob:")
    )
      external.push(req.url());
  });
  await page.goto(url);
  await page.getByRole("heading", { name: /Một lá số/ }).waitFor();
  await page.screenshot({
    path: "artifacts/website-desktop.png",
    fullPage: true,
  });
  await page.locator("[name=year]").fill("2000");
  await page.locator("[name=hour]").fill("2");
  await page
    .locator("[name=place]")
    .fill("Địa điểm minh họa, không phải hồ sơ người thật");
  await page.getByRole("button", { name: "Kiểm tra thông tin sinh" }).click();
  await page.locator("#confirm-birth").waitFor();
  const generate = page.getByRole("button", {
    name: "Lập lá số và tạo báo cáo",
  });
  assert(await generate.isDisabled());
  for (const box of await page.locator(".vi-confirm-item input").all())
    await box.check();
  await generate.click();
  await page.getByRole("heading", { name: "Báo cáo của bạn" }).waitFor();
  assert.equal(await page.locator(".vi-palace").count(), 12);
  assert.equal(await page.locator(".vi-topic[id^=topic-]").count(), 14);
  assert.equal(
    await page
      .getByText("Sao chưa có thuật ngữ Việt", { exact: false })
      .count(),
    0,
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Tải báo cáo PDF" }).click(),
  ]);
  await download.saveAs("artifacts/bao-cao-trinh-duyet.pdf");
  const pdf = await readFile("artifacts/bao-cao-trinh-duyet.pdf");
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  await page.screenshot({
    path: "artifacts/website-report.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.locator("#report").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/website-mobile.png" });
  // A local .zst file never becomes an upload request; Worker reads it on-device.
  if (process.env.V4_TEST_FILE) {
    await page.locator("[name=year]").fill(process.env.V4_TEST_YEAR ?? "2005");
    await page.locator("[name=hour]").fill("0");
    await page.getByRole("button", { name: "Kiểm tra thông tin sinh" }).click();
    for (const box of await page.locator(".vi-confirm-item input").all())
      await box.check();
    await generate.click();
    await page.getByRole("heading", { name: "Báo cáo của bạn" }).waitFor();
    await page
      .locator("input[type=file]")
      .setInputFiles(process.env.V4_TEST_FILE);
    await page
      .getByText("Đã kiểm SHA-256 và đúng một bản ghi.", { exact: false })
      .waitFor({ timeout: 180000 });
    await page.reload();
    assert.equal(
      await page.locator("#report").count(),
      0,
      "personal report is not persisted",
    );
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(
    external,
    [],
    "normal report/PDF/import sends no external requests",
  );
  console.log(
    "Browser passed: static subpath, confirmation, 12 palaces, 14 topics, PDF, mobile width, no external requests" +
      (process.env.V4_TEST_FILE
        ? ", real Zstandard Worker/import privacy"
        : ""),
  );
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
