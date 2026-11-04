import { RULES } from "../../content/vi/rules";
import { validateRules } from "./validation";
import { BRANCHES_VI, TOPICS, palaceVi, starVi, HUA_VI } from "./locale";
import type {
  ChartFacts,
  DatasetReceipt,
  Report,
  Topic,
  Assessment,
  Rule,
} from "./types";
const palaceByTopic: Partial<Record<Topic, string>> = {
  overview: "命宫",
  personality: "命宫",
  learning: "命宫",
  career: "官禄",
  wealth: "财帛",
  love: "夫妻",
  parents: "父母",
  family: "兄弟",
  children: "子女",
  friends: "仆役",
  move: "迁移",
  home: "田宅",
  spirit: "福德",
  health: "疾厄",
};
export function interpret(
  facts: ChartFacts,
  dataset: DatasetReceipt | null = null,
  rules: Rule[] = RULES,
): Report {
  const assessments = validateRules(facts, rules);
  const sections = TOPICS.map(([id, title]) => {
    const p = facts.palaces.find((p) => p.name === palaceByTopic[id])!;
    const majors = p.stars
      .filter((s) => s.type === "major")
      .map((s) => starVi(s.name) + (s.siHua ? " " + HUA_VI[s.siHua] : ""));
    const factTexts = [
      `${palaceVi(p.name)} tại ${BRANCHES_VI[p.branch]}: ${majors.join(", ") || "vô chính diệu"}.`,
      `Tam hợp: ${p.trines.map((b) => palaceVi(facts.palaces.find((x) => x.branch === b)!.name)).join(", ")}. Đối cung: ${palaceVi(facts.palaces.find((x) => x.branch === p.opposite)!.name)}.`,
    ];
    if (p.isEmpty)
      factTexts.push(
        "Mượn chính tinh đối cung để tham khảo: " +
          (p.borrowedStars?.map(starVi).join(", ") || "không có") +
          ". Vị trí sao thực không thay đổi.",
      );
    if (id === "overview")
      factTexts.push(
        `Thân tại ${BRANCHES_VI[facts.shen]}, cư ${palaceVi(facts.palaces.find((p) => p.branch === facts.shen)!.name)}.`,
      );
    // Deterministic semantic deduplication uses authored concepts, never keyword similarity.
    const best = new Map<string, Assessment>();
    for (const a of assessments
      .filter((a) => a.status === "APPLICABLE" && a.rule.topic === id)
      .sort(
        (a, b) =>
          b.rule.priority - a.rule.priority ||
          (a.rule.id < b.rule.id ? -1 : a.rule.id > b.rule.id ? 1 : 0),
      ))
      if (!best.has(a.rule.concept)) best.set(a.rule.concept, a);
    const paragraphs = [...best.values()].map((a) => ({
      id: a.rule.id,
      text: a.rule.textVi,
      source: a.rule.source,
      evidence: a.evidence,
      tone: a.rule.tone,
    }));
    return {
      id,
      title,
      facts: factTexts,
      paragraphs,
      gap: paragraphs.length
        ? null
        : "Chưa có quy tắc tiếng Việt đã kiểm thử cho cấu hình này. Chỉ trình bày dữ kiện; không dùng bản ghi gần nhất hoặc tự tạo lời luận.",
    };
  });
  const tensions = assessments
    .filter((a) => a.status === "APPLICABLE" && a.rule.conflictGroup)
    .map(
      (a) =>
        a.rule.note ??
        "Có các cách diễn giải chưa phân xử; không chọn phía tích cực hơn.",
    );
  const highlights = sections
    .filter((s) => s.paragraphs.length)
    .slice(0, 5)
    .map(
      (s) =>
        `${s.title}: có ${s.paragraphs.length} nhận định khớp điều kiện; xem dẫn chứng tại mục tương ứng.`,
    );
  return {
    version: "report-1.1.0",
    interpretationComplete: false,
    facts,
    sections,
    assessments,
    highlights,
    tensions: [...new Set(tensions)],
    coverage: {
      rules: rules.length,
      applicable: assessments.filter((a) => a.status === "APPLICABLE").length,
      topicsWithText: sections.filter((s) => s.paragraphs.length).length,
      topics: TOPICS.length,
      vietnameseDatasetRecords: 0,
    },
    dataset,
    limits: [
      "MVP chỉ dùng tập quy tắc Việt tĩnh đã hình thức hóa; chưa dịch và xác minh toàn bộ 674.976 bản ghi v4.0.",
      "APPLICABLE xác nhận điều kiện sao/cung, không chứng minh dự đoán tử vi đúng thực tế.",
      "Văn bản tự do v4.0 luôn UNVERIFIED; không được đưa nguyên khối vào kết luận cá nhân. Từ khóa không phải phép kiểm chứng.",
      "Các cách cục trong ChartFacts hiện chỉ xác nhận cấu trúc Tử Phủ/Xương Khúc thực tại Mệnh; chưa chuyển toàn bộ patterns.ts vào quy tắc Việt.",
      "Vận hạn chỉ gồm đại hạn và Tứ Hóa năm từ mã gốc. Chưa có quy tắc dự báo sự kiện theo năm/tháng, nên không tạo dự báo.",
      "Múi giờ lịch sử dùng IANA 2025b đã khóa trong moment-timezone 0.6.0. Cần cập nhật có kiểm thử nếu luật giờ thay đổi; kinh độ và địa danh cần người dùng xác nhận.",
      "Nguồn về sức khỏe chỉ tham khảo văn hóa, không chẩn đoán hoặc dự báo tuổi thọ.",
    ],
  };
}
export function markdownReport(r: Report): string {
  const f = r.facts;
  return [
    "# Báo cáo Tử Vi Đẩu Số",
    "**BẢN NỘI DUNG CHƯA ĐẦY ĐỦ. Có nhận định cho một chủ đề không có nghĩa đã luận đủ mọi tổ hợp của chủ đề đó.**",
    `Phiên bản: ${r.version}; ${f.algorithmVersion}; ${f.contentVersion}; bảng ${f.school}.`,
    `Ngày lập lá số: ${f.normalized.chartDate.year}-${f.normalized.chartDate.month}-${f.normalized.chartDate.day}; giờ ${BRANCHES_VI[f.normalized.branch]}.`,
    `Độ bao phủ: ${r.coverage.topicsWithText}/${r.coverage.topics} chủ đề có nhận định; 0 bản ghi v4.0 được tuyên bố dịch đầy đủ.`,
    ...r.sections.flatMap((s) => [
      `## ${s.title}`,
      ...s.facts,
      ...s.paragraphs.map(
        (p) =>
          `${p.text}\n\nNguồn [${p.id}]: ${p.source.title}; ${p.source.locator}.`,
      ),
      ...(s.gap ? [s.gap] : []),
    ]),
    "## Vận hạn",
    ...(f.period
      ? [
          `Năm âm lịch ${f.period.year}, tuổi mụ ${f.period.nominalAge}, chỉ số đại hạn ${f.period.daxianIndex}.`,
        ]
      : [
          "Chưa chọn năm tham chiếu; không dùng đồng hồ hệ thống để tự chọn đại hạn hiện tại.",
        ]),
    ...f.daxian.map(
      (x) => `${x.startAge}–${x.endAge} tuổi mụ: ${palaceVi(x.palaceName)}.`,
    ),
    "## Khác biệt chưa phân xử",
    ...r.tensions,
    "## Giới hạn",
    ...r.limits,
    "## Quy tắc bị loại/giữ lại cho kiểm tra",
    ...r.assessments
      .filter((a) => a.status !== "APPLICABLE")
      .map((a) => `- ${a.rule.id}: ${a.status}. ${a.reasons.join("; ")}`),
  ].join("\n\n");
}
