import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BRANCHES_VI,
  BRIGHT_VI,
  HUA_VI,
  GLOSSARY,
  palaceVi,
  starVi,
} from "./locale";
import { markdownReport } from "./interpret";
import type { Report } from "./types";
let fontPromise: Promise<string> | undefined;
async function loadFont(url: string): Promise<string> {
  if (!fontPromise)
    fontPromise = fetch(url)
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            "Không tải được font cục bộ. Hãy kiểm tra tệp public/fonts/Report.ttf.",
          );
        const bytes = new Uint8Array(await res.arrayBuffer());
        let s = "";
        for (let i = 0; i < bytes.length; i += 8192)
          s += String.fromCharCode(...bytes.subarray(i, i + 8192));
        return btoa(s);
      })
      .catch((e) => {
        fontPromise = undefined;
        throw e;
      });
  return fontPromise;
}
export async function createPdf(
  report: Report,
  fontUrl: string,
): Promise<Uint8Array> {
  return renderPdf(report, await loadFont(fontUrl));
}
/** Shared pure renderer used by browser and Node regression tests. Font bytes are an explicit dependency. */
export function renderPdf(r: Report, fontBase64: string): Uint8Array {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });
  doc.addFileToVFS("Report.ttf", fontBase64);
  doc.addFont("Report.ttf", "Report", "normal");
  doc.setFont("Report");
  doc.setCreationDate(new Date("2000-01-01T00:00:00Z"));
  // Fixed metadata prevents clock/randomness from changing the exported bytes for identical input.
  const glyphs = doc.getFont().metadata as unknown as {
    characterToGlyph: (code: number) => number;
  };
  // Never silently export missing glyph boxes for a newly entered place or future content.
  const printable =
    JSON.stringify(r.facts) + JSON.stringify(r.assessments) + markdownReport(r);
  const missing = [
    ...new Set(
      [...printable].filter(
        (ch) =>
          ch.codePointAt(0)! >= 32 &&
          glyphs.characterToGlyph(ch.codePointAt(0)!) === 0,
      ),
    ),
  ];
  if (missing.length)
    throw new Error(
      "Font báo cáo chưa hỗ trợ các ký tự: " +
        missing.slice(0, 20).join(" ") +
        " . Chưa xuất PDF để tránh lỗi font; có thể tải JSON/Markdown và báo người bảo trì mở rộng font.",
    );
  doc.setFileId("0123456789ABCDEF0123456789ABCDEF");
  doc.setProperties({
    title: "Báo cáo Tử Vi Đẩu Số",
    subject: r.version,
    author: "Ziwei — bộ quy tắc tĩnh",
    creator: "ziwei deterministic MVP",
  });
  const f = r.facts;
  let y = 25;
  const toc: { title: string; page: number }[] = [];
  const line = (text: string, size = 10, color = "#29241f") => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, 172) as string[];
    for (const value of lines) {
      if (y > 273) {
        doc.addPage();
        y = 24;
      }
      doc.text(value, 19, y);
      y += size * 0.46 + 1;
    }
    y += 2;
  };
  const heading = (title: string, level = 1) => {
    if (y > 250) {
      doc.addPage();
      y = 24;
    }
    line(title, level === 1 ? 17 : 12, "#8b3027");
    y += 2;
  };
  const section = (title: string) => {
    if (doc.getNumberOfPages() > 2 || y > 25) doc.addPage();
    y = 25;
    toc.push({ title, page: doc.getNumberOfPages() });
    heading(title);
  };
  const rows = (headers: string[], body: string[][]) => {
    autoTable(doc, {
      startY: y,
      head: [headers],
      body,
      margin: { left: 19, right: 19, top: 22, bottom: 19 },
      styles: {
        font: "Report",
        fontStyle: "normal",
        fontSize: 8.5,
        cellPadding: 2.4,
        overflow: "linebreak",
        lineWidth: 0.1,
        lineColor: "#e2d6c5",
        textColor: "#29241f",
      },
      headStyles: {
        fillColor: "#8b3027",
        textColor: "#fff9ef",
        fontStyle: "normal",
      },
      alternateRowStyles: { fillColor: "#faf6ed" },
      rowPageBreak: "avoid",
      didDrawPage: () => {},
    });
    y =
      (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 7;
  };
  doc.setFillColor("#f7f0e4");
  doc.rect(0, 0, 210, 297, "F");
  doc.setDrawColor("#b39354");
  doc.rect(13, 13, 184, 271);
  y = 53;
  line("TỬ VI ĐẨU SỐ", 28, "#8b3027");
  line("Lá số và báo cáo tham khảo", 17);
  y += 12;
  line(
    `${f.normalized.civilSolar.day}/${f.normalized.civilSolar.month}/${f.normalized.civilSolar.year} · ${String(f.normalized.input.hour).padStart(2, "0")}:${String(f.normalized.input.minute).padStart(2, "0")} · ${f.normalized.input.gender === "male" ? "Nam" : "Nữ"}`,
    14,
  );
  line(f.normalized.input.place + " · " + f.normalized.input.country, 12);
  line(
    `Giờ địa chi: ${BRANCHES_VI[f.normalized.branch]} · Bảng ${f.school}`,
    12,
  );
  y += 12;
  line(
    "Từ thuật toán, dữ kiện và tài nguyên tiếng Việt tĩnh. Không gọi dịch vụ tạo văn bản.",
  );
  line(
    `Độ bao phủ: ${r.coverage.topicsWithText}/${r.coverage.topics} chủ đề có nhận định kiểm tra điều kiện. ${r.coverage.rules} quy tắc hiện có; chưa phủ mọi lá số.`,
  );
  line(
    "Văn bản tự do v4.0 không được đưa nguyên khối vào kết luận cá nhân. APPLICABLE chỉ là khớp điều kiện hình thức, không chứng minh dự đoán đúng.",
  );
  line(
    "Hồ sơ xử lý cục bộ trên thiết bị. Không gửi thông tin sinh lên GitHub.",
  );
  doc.addPage(); // Reserve page 2 for a real page-numbered table of contents.
  section("I. Hồ sơ và sơ đồ lá số");
  rows(
    ["Thông tin", "Giá trị"],
    [
      [
        "Ngày dân dụng",
        `${f.normalized.civilSolar.year}-${f.normalized.civilSolar.month}-${f.normalized.civilSolar.day}`,
      ],
      ["Nơi sinh", f.normalized.input.place],
      [
        "Múi giờ",
        `${f.normalized.input.timeZone}; thực tế ${f.normalized.actualOffsetMinutes} phút; chuẩn ${f.normalized.input.standardOffsetMinutes} phút`,
      ],
      [
        "Ngày lập lá số",
        `${f.normalized.chartDate.year}-${f.normalized.chartDate.month}-${f.normalized.chartDate.day}`,
      ],
      [
        "Hiệu chỉnh",
        `${f.normalized.input.solarCorrection ? "Có" : "Không"}; kinh độ ${f.normalized.input.longitude ?? "chưa nhập"}; ${f.normalized.correction.hour}:${String(f.normalized.correction.minute).padStart(2, "0")}:${String(f.normalized.correction.second).padStart(2, "0")}`,
      ],
      [
        "Âm lịch thực của ngày lập lá số",
        `${f.lunar.lunarDay}/${Math.abs(f.lunar.lunarMonth)}/${f.lunar.lunarYear}; ${f.lunar.isLeapMonth ? "nhuận" : "không nhuận"}`,
      ],
      [
        "Tháng âm dùng an sao",
        `${f.effectiveLunar.lunarMonth}/${f.effectiveLunar.lunarYear}; quy tắc ${f.normalized.input.leapPolicy}`,
      ],
      ["Múi giờ đã khóa", f.normalized.timeZoneVersion],
      [
        "Mệnh / Thân",
        `${BRANCHES_VI[f.ming]} / ${BRANCHES_VI[f.shen]}; Thân cư ${palaceVi(f.palaces.find((p) => p.branch === f.shen)!.name)}`,
      ],
      [
        "Cục",
        `${f.ju === 2 ? "Thủy" : f.ju === 3 ? "Mộc" : f.ju === 4 ? "Kim" : f.ju === 5 ? "Thổ" : "Hỏa"} ${f.ju} cục`,
      ],
    ],
  );
  for (const n of f.normalized.notices)
    line("Đã yêu cầu xác nhận: " + n.text, 9);
  doc.addPage();
  y = 25;
  heading("Sơ đồ 12 cung — vị trí thực tế");
  const ring = [5, 6, 7, 8, 4, null, null, 9, 3, null, null, 10, 2, 1, 0, 11];
  const gridY = y,
    cellW = 43,
    cellH = 47;
  ring.forEach((branch, index) => {
    if (branch === null) return;
    const p = f.palaces.find((p) => p.branch === branch)!;
    const x = 19 + (index % 4) * cellW,
      top = gridY + Math.floor(index / 4) * cellH;
    doc.setDrawColor("#b39354");
    doc.rect(x, top, cellW, cellH);
    doc.setFontSize(8);
    doc.setTextColor("#8b3027");
    doc.text(`${palaceVi(p.name)} · ${BRANCHES_VI[branch]}`, x + 2, top + 6);
    const names = p.stars
      .filter((s) => s.type === "major")
      .map((s) => starVi(s.name));
    const text = (names.length ? names : ["Vô chính diệu"]).concat(
      p.stars
        .filter((s) => s.type !== "major")
        .slice(0, 3)
        .map((s) => starVi(s.name)),
    );
    doc.setTextColor("#29241f");
    let yy = top + 12;
    for (const name of text) {
      for (const l of doc.splitTextToSize(name, cellW - 4)) {
        if (yy < top + cellH - 6) {
          doc.text(l, x + 2, yy);
          yy += 4;
        }
      }
    }
    doc.setFontSize(7);
    doc.text(
      `${p.daXianAge?.[0]}–${p.daXianAge?.[1]} tuổi mụ`,
      x + 2,
      top + cellH - 3,
    );
  });
  doc.setFontSize(14);
  doc.text("MỆNH • THÂN", 19 + cellW * 2, gridY + cellH * 1.7, {
    align: "center",
  });
  doc.setFontSize(9);
  doc.text("Bảng sao đầy đủ ở phụ lục", 19 + cellW * 2, gridY + cellH * 2, {
    align: "center",
  });
  y = gridY + 4 * cellH + 8;
  line(
    "Sơ đồ rút gọn phụ tinh để dễ đọc; vị trí và toàn bộ sao ở bảng phụ lục. Sao mượn không được vẽ như sao tọa thủ.",
    9,
  );
  rows(
    ["Tứ Hóa bản mệnh", "Sao thực", "Cung"],
    f.sihua.map((s) => [HUA_VI[s.hua], starVi(s.star), palaceVi(s.palace)]),
  );
  section("II. Tổng quan mệnh cách");
  const addTopic = (id: string) => {
    const s = r.sections.find((s) => s.id === id)!;
    heading(s.title, 2);
    for (const text of s.facts) line(text);
    for (const para of s.paragraphs) {
      line(para.text);
      line(
        `[${para.id}] ${para.source.title}; ${para.source.locator}`,
        8,
        "#6c6256",
      );
    }
    if (s.gap) line(s.gap, 10, "#6c6256");
  };
  addTopic("overview");
  heading("Cách cục xác nhận về cấu trúc", 2);
  if (!f.patterns.length)
    line(
      "Không có cách cục trong tập định nghĩa cấu trúc MVP hiện tại. Không suy thành lá số không có cách cục khác.",
    );
  for (const p of f.patterns) line(p.name + " — " + p.evidence.join("; "));
  section("III. Luận giải theo chủ đề");
  for (const s of r.sections.filter((s) => s.id !== "overview")) addTopic(s.id);
  section("IV. Đại hạn và năm tham chiếu");
  if (f.period) {
    line(`Năm âm lịch ${f.period.year}; tuổi mụ ${f.period.nominalAge}.`);
    line(
      f.period.daxianIndex < 0
        ? "Nằm trước/sau các đại hạn được liệt kê."
        : `Đại hạn của năm được chọn: ${f.daxian[f.period.daxianIndex].startAge}–${f.daxian[f.period.daxianIndex].endAge} tuổi mụ, tại ${palaceVi(f.daxian[f.period.daxianIndex].palaceName)}.`,
    );
    rows(
      ["Tứ Hóa năm (lớp riêng)", "Sao"],
      Object.entries(f.period.yearSihua).map(([h, s]) => [
        HUA_VI[h],
        starVi(s),
      ]),
    );
  } else
    line(
      "Chưa chọn năm tham chiếu. Không lấy đồng hồ hệ thống để tạo đại hạn hiện tại.",
    );
  rows(
    ["Tuổi mụ", "Cung đại hạn", "Khoảng năm âm lịch"],
    f.daxian.map((dx) => [
      `${dx.startAge}–${dx.endAge}`,
      palaceVi(dx.palaceName),
      `${f.lunar.lunarYear + dx.startAge - 1}–${f.lunar.lunarYear + dx.endAge - 1}`,
    ]),
  );
  line(
    "MVP chưa có quy tắc dự báo sự kiện năm/tháng. Tứ Hóa năm chỉ là lớp dữ kiện, không ghi đè Tứ Hóa bản mệnh.",
  );
  section("V. Tổng hợp và giới hạn");
  for (const x of r.highlights) line(x);
  for (const x of r.tensions) line("Chưa phân xử: " + x);
  for (const x of r.limits) line(x);
  line(
    `v4.0: ${r.dataset ? "đã xác thực đúng khóa " + r.dataset.key + ", SHA-256 " + r.dataset.sha256 : "chưa tải/không có bản ghi nguồn trong báo cáo này"}. Toàn bộ văn bản tự do giữ trạng thái UNVERIFIED; 0 bản ghi được tuyên bố dịch Việt đầy đủ.`,
  );
  section("Phụ lục A. Toàn bộ sao và quan hệ cung");
  for (const p of f.palaces) {
    heading(`${palaceVi(p.name)} / ${p.name} — ${BRANCHES_VI[p.branch]}`, 2);
    rows(
      ["Sao", "Loại", "Độ sáng " + f.school, "Tứ Hóa"],
      p.stars.map((s) => [
        `${starVi(s.name)} (${s.name})`,
        s.type === "major"
          ? "Chính tinh"
          : s.type === "sha"
            ? "Sát tinh"
            : "Phụ tinh",
        s.brightnessRaw
          ? (BRIGHT_VI[s.brightnessRaw] ?? s.brightnessRaw)
          : "Không có dữ liệu",
        s.siHua ? HUA_VI[s.siHua] : "—",
      ]),
    );
    line(
      `Tam hợp ${p.trines.map((b) => BRANCHES_VI[b]).join(", ")}; đối cung ${BRANCHES_VI[p.opposite]}. Sao mượn: ${p.borrowedStars?.map(starVi).join(", ") || "không"}.`,
      9,
    );
  }
  section("Phụ lục B. Kiểm tra quy tắc và nguồn");
  for (const a of r.assessments) {
    heading(`${a.rule.id} — ${a.status}`, 2);
    line(a.rule.source.title + "; " + a.rule.source.locator, 9);
    line("Nguồn: " + a.rule.source.url, 8);
    line("Nguyên văn nguồn: " + a.rule.source.original, 9);
    for (const e of a.evidence) line("Dữ kiện: " + e, 8);
    for (const reason of a.reasons) line("Lý do: " + reason, 9);
  }
  section("Phụ lục C. Thuật ngữ và phiên bản");
  rows(["Thuật ngữ", "Giải thích"], GLOSSARY);
  line(f.algorithmVersion, 9);
  line(
    `Quy tắc ${f.contentVersion}; báo cáo ${r.version}; bảng ${f.school}; dữ liệu v4.0 ca268829f7a9 / XD2.`,
    9,
  );
  line(
    "Mã nguồn MIT; dữ liệu v4.0 CC BY 4.0, nguồn Renhuai123/ziwei-doushu, tác giả 王多鱼AI. Cổ thư thuộc phạm vi công cộng. Tập Việt MVP không sử dụng trích lời bài giảng có điều kiện phi thương mại. Chưa được chuyên gia Hán văn/Tử Vi hiệu đính độc lập.",
    9,
  );
  line(
    "Bản đầy đủ ChartFacts có thể tải JSON riêng từ website. Báo cáo không dùng AI, không gọi API trả phí và không chứa dự báo tự phát minh.",
    9,
  );
  const pages = doc.getNumberOfPages();
  doc.setPage(2);
  y = 27;
  heading("Mục lục");
  for (const item of toc) {
    line(`${item.title} ................................ ${item.page}`, 11);
  }
  line(
    "Các phần ngắn/dài theo dữ kiện và độ bao phủ; không đặt số trang cố định.",
    9,
  );
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont("Report");
    doc.setFontSize(8);
    doc.setTextColor("#6c6256");
    doc.text(`TỬ VI ĐẨU SỐ · ${f.school} · ${page}/${pages}`, 105, 288, {
      align: "center",
    });
  }
  return new Uint8Array(doc.output("arraybuffer"));
}
export function downloadBytes(
  data: Uint8Array | string,
  name: string,
  type: string,
) {
  const blob = new Blob(
    [typeof data === "string" ? data : new Uint8Array(data)],
    { type },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const reportMarkdown = markdownReport;
