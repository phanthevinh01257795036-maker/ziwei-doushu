import { checkDatasetReceipt, datasetIdentity, V4_MANIFEST } from "./v4";
import type { ChartFacts, DatasetReceipt } from "./types";
const CACHE = "ziwei-v4-compressed-1";
export async function loadDataset(
  facts: ChartFacts,
  workerUrl: string,
  onProgress: (stage: string) => void,
  file?: File,
): Promise<DatasetReceipt> {
  const identity = datasetIdentity(facts);
  const asset =
    V4_MANIFEST.years[String(identity.year) as keyof typeof V4_MANIFEST.years];
  if (!asset)
    throw new Error("Không có dữ liệu v4.0 cho năm này (chỉ 1950–2026).");
  onProgress("Kiểm tra cache tệp năm " + identity.year + "…");
  const cache = typeof caches !== "undefined" ? await caches.open(CACHE) : null;
  const cacheKey = new URL(
    `./v4-cache/${identity.year}-${asset.sha256}`,
    location.href,
  ).href;
  let blob: Blob | undefined;
  if (file) blob = file;
  else {
    const cached = await cache?.match(cacheKey);
    if (cached) blob = await cached.blob();
    if (!blob) {
      onProgress("Tải riêng " + asset.file + "…");
      try {
        const res = await fetch(asset.url, {
          credentials: "omit",
          referrerPolicy: "no-referrer",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        blob = await res.blob();
      } catch {
        throw new Error(
          "GitHub không cho trình duyệt tải trực tiếp (CORS hoặc mạng). Dùng liên kết tải riêng năm bên dưới rồi chọn tệp .zst; báo cáo quy tắc vẫn dùng được.",
        );
      }
    }
  }
  if (blob.size !== asset.compressedBytes)
    throw new Error("Tệp năm sai kích thước.");
  onProgress("Kiểm tra SHA-256 rồi giải nén trong luồng nền…");
  const buffer = await blob.arrayBuffer();
  try {
    const receipt = await new Promise<DatasetReceipt>((resolve, reject) => {
      const worker = new Worker(workerUrl, { type: "module" });
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(
          new Error(
            "Giải nén quá 180 giây. Có thể thiết bị thiếu RAM; hãy thử máy tính.",
          ),
        );
      }, 180000);
      const finish = () => {
        clearTimeout(timeout);
        worker.terminate();
      };
      worker.onerror = () => {
        finish();
        reject(
          new Error(
            "Không chạy được luồng nền; kiểm tra hỗ trợ Worker và bộ nhớ trình duyệt.",
          ),
        );
      };
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.type === "progress")
          onProgress(
            `Đang giải nén và tìm đúng khóa: ${e.data.value}% dữ liệu nén`,
          );
        else if (e.data.type === "done") {
          finish();
          resolve(e.data.result);
        } else if (e.data.type === "error") {
          finish();
          reject(new Error(e.data.message));
        }
      };
      worker.postMessage({ buffer, identity }, [buffer]);
    });
    checkDatasetReceipt(receipt, facts);
    // Cache contains only public compressed annual data, never the visitor's birth or report.
    try {
      await cache?.put(cacheKey, new Response(blob));
    } catch {
      /* Storage quota: keep working in memory. */
    }
    return receipt;
  } catch (e) {
    await cache?.delete(cacheKey);
    throw e;
  }
}
export async function clearDatasetCache() {
  if (typeof caches !== "undefined") await caches.delete(CACHE);
}
