import { extractYear } from "../lib/report/v4";
self.onmessage = async (event: MessageEvent) => {
  try {
    const result = await extractYear(
      event.data.buffer,
      event.data.identity,
      (n) => self.postMessage({ type: "progress", value: n }),
    );
    self.postMessage({ type: "done", result });
  } catch (e) {
    self.postMessage({
      type: "error",
      message:
        e instanceof Error ? e.message : "Không thể giải nén năm dữ liệu.",
    });
  }
};
