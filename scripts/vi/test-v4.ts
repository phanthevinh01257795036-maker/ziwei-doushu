import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { extractYear, V4_MANIFEST } from "../../lib/report/v4";
async function main() {
  const file = process.env.V4_TEST_FILE;
  if (!file) {
    console.log(
      "V4_TEST_FILE chưa đặt: không tự tải nhiều năm. Kiểm tra parser tổng hợp nằm trong test:vi.",
    );
    return;
  }
  const year = Number(process.env.V4_TEST_YEAR ?? 2005);
  const id = {
    year,
    month: 1,
    day: 1,
    hour: 0,
    gender: "male" as const,
    key: `${year}-01-01-0-male`,
  };
  const bytes = readFileSync(file);
  const array = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const result = await extractYear(array, id);
  assert.equal(result.key, id.key);
  assert.equal(Object.keys(result.record.c).length, 13);
  assert.equal(result.status, "UNVERIFIED");
  assert(result.verified);
  const bad = bytes.slice();
  bad[bad.length - 1] ^= 1;
  await assert.rejects(
    extractYear(
      bad.buffer.slice(
        bad.byteOffset,
        bad.byteOffset + bad.byteLength,
      ) as ArrayBuffer,
      id,
    ),
    /SHA-256/,
  );
  assert.equal(
    result.sha256,
    V4_MANIFEST.years[String(year) as keyof typeof V4_MANIFEST.years].sha256,
  );
  console.log(
    "Real release: long-window Zstandard decoded, exact synthetic key/13 dimensions/checksum accepted; tampering rejected.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
