import manifest from "../../content/v4/manifest.json";
import type { ChartFacts, DatasetReceipt, V4Record } from "./types";
export { manifest as V4_MANIFEST };
export const DIMENSIONS = [
  "overview",
  "personality",
  "love",
  "career",
  "wealth",
  "health",
  "family",
  "children",
  "move",
  "friends",
  "home",
  "spirit",
  "parents",
] as const;
export function datasetIdentity(f: ChartFacts) {
  const d = f.normalized.chartDate;
  return {
    year: d.year,
    month: d.month,
    day: d.day,
    hour: f.normalized.branch,
    gender: f.normalized.input.gender,
    key: `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}-${f.normalized.branch}-${f.normalized.input.gender}`,
  };
}
export function checkRecord(
  value: unknown,
  identity: ReturnType<typeof datasetIdentity>,
): V4Record {
  if (!value || typeof value !== "object")
    throw new Error("Bản ghi không phải đối tượng JSON.");
  const r = value as V4Record;
  if (
    r.k !== identity.key ||
    r.y !== identity.year ||
    r.m !== identity.month ||
    r.d !== identity.day ||
    r.h !== identity.hour ||
    r.g !== identity.gender
  )
    throw new Error("Trường k/y/m/d/h/g không khớp yêu cầu.");
  if (
    !(r.ms === null || typeof r.ms === "string") ||
    !r.c ||
    Object.keys(r.c).length !== 13 ||
    DIMENSIONS.some((k) => typeof r.c[k] !== "string" || !r.c[k].trim())
  )
    throw new Error("Bản ghi không đủ 13 nhóm hoặc ms không hợp lệ.");
  return r;
}
/** Bind a receipt to THIS chart. A checksum verifies an asset, not its interpretation. */
export function checkDatasetReceipt(receipt: DatasetReceipt, facts: ChartFacts): void {
  const identity = datasetIdentity(facts);
  const asset = manifest.years[String(identity.year) as keyof typeof manifest.years];
  checkRecord(receipt.record, identity);
  if (!asset || receipt.key !== identity.key || receipt.year !== identity.year ||
      receipt.release !== manifest.release || receipt.sha256 !== asset.sha256 ||
      receipt.contentVersion !== manifest.contentVersion || receipt.sourceSchool !== manifest.brightnessSchool ||
      receipt.verified !== true || receipt.status !== "UNVERIFIED" || receipt.translation !== "not-translated")
    throw new Error("Biên nhận v4.0 không khớp lá số hoặc phiên bản dữ liệu đã khóa.");
  const ming = facts.palaces.find((p) => p.branch === facts.ming)!;
  const firstMajor = ming.stars.find((s) => s.type === "major")?.name ?? null;
  if (receipt.record.ms !== firstMajor)
    throw new Error("Chính tinh Mệnh của bản ghi khác thuật toán; từ chối gắn dữ liệu.");
}
/** Streaming long-window Zstandard reader. Never holds a whole decompressed year in RAM. */
export class YearScanner {
  private pending = "";
  private decoder = new TextDecoder("utf-8", { fatal: true });
  private found: V4Record | null = null;
  private count = 0;
  private lines = 0;
  constructor(
    private identity: ReturnType<typeof datasetIdentity>,
    private maxLine = 2_000_000,
  ) {}
  private line(line: string) {
    if (!line.trim()) return;
    this.lines++;
    const r = JSON.parse(line) as V4Record;
    if (r.k === this.identity.key) {
      this.count++;
      this.found = checkRecord(r, this.identity);
    }
  }
  push(bytes: Uint8Array, final = false) {
    this.pending += this.decoder.decode(bytes, { stream: !final });
    let index: number;
    while ((index = this.pending.indexOf("\n")) !== -1) {
      const line = this.pending.slice(0, index);
      if (line.length > this.maxLine) throw new Error("Dòng dữ liệu quá lớn.");
      this.line(line);
      this.pending = this.pending.slice(index + 1);
    }
    if (this.pending.length > this.maxLine)
      throw new Error("Dòng dữ liệu quá lớn.");
    if (final && this.pending) {
      this.line(this.pending);
      this.pending = "";
    }
  }
  finish() {
    if (this.count !== 1 || !this.found)
      throw new Error(
        this.count
          ? "Có bản ghi trùng khóa; không chấp nhận."
          : "Không tìm thấy đúng bản ghi; không thay bằng ngày gần nhất.",
      );
    return { record: this.found, lines: this.lines };
  }
}
export async function extractYear(
  buffer: ArrayBuffer,
  identity: ReturnType<typeof datasetIdentity>,
  progress?: (n: number) => void,
): Promise<DatasetReceipt> {
  const asset =
    manifest.years[String(identity.year) as keyof typeof manifest.years];
  if (!asset)
    throw new Error(
      "v4.0 chỉ có năm 1950–2026. Lá số vẫn lập được; dữ liệu năm này không có.",
    );
  if (buffer.byteLength !== asset.compressedBytes)
    throw new Error("Kích thước tệp không đúng tài sản đã khóa.");
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const hash = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  if (hash !== asset.sha256)
    throw new Error("SHA-256 không khớp; từ chối dữ liệu.");
  const scanner = new YearScanner(identity);
  let expanded = 0;
  const { Zstd } = await import("@hpcc-js/wasm-zstd");
  const zstd = await Zstd.load();
  zstd.resetDecompression();
  const bytes = new Uint8Array(buffer);
  const size = 1024; // Cap expanded temporary chunks even for highly repetitive years.
  try {
    for (let i = 0; i < bytes.length; i += size) {
      const output = zstd.decompressChunk(bytes.subarray(i, i + size));
      expanded += output.byteLength;
      if (expanded > 1_600_000_000)
        throw new Error("Tệp vượt giới hạn giải nén 1,6 GB.");
      scanner.push(output);
      progress?.(Math.min(100, Math.round(((i + size) / bytes.length) * 100)));
    }
    zstd.decompressEnd();
    scanner.push(new Uint8Array(0), true);
  } finally {
    zstd.resetDecompression();
  }
  const { record } = scanner.finish();
  return {
    release: "v4.0-13d",
    key: identity.key,
    year: identity.year,
    sha256: hash,
    verified: true,
    sourceSchool: "XD2",
    contentVersion: manifest.contentVersion,
    record,
    status: "UNVERIFIED",
    translation: "not-translated",
  };
}
