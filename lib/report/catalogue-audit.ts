import { contentReviewMatches } from "../../content/vi/review";
import { SI_HUA_TABLE } from "../ziwei/constants";
import { PALACE_VI, STAR_VI } from "./locale";
import type { Predicate, Rule } from "./types";
const possibleHua = new Map<string, Set<string>>();
for (const row of Object.values(SI_HUA_TABLE)) {
  row.forEach((star, i) => {
    const values = possibleHua.get(star) ?? new Set<string>();
    values.add(["禄", "权", "科", "忌"][i]);
    possibleHua.set(star, values);
  });
}
export function predicateIssues(p: Predicate): string[] {
  if (p.kind === "unknown") return [];
  const errors: string[] = [];
  if (!(p.palace in PALACE_VI))
    errors.push("Điều kiện dùng cung không được hỗ trợ.");
  if (p.kind === "resident") {
    if (!p.stars.length)
      errors.push("Điều kiện tọa thủ không được để danh sách sao rỗng.");
    if (new Set(p.stars).size !== p.stars.length)
      errors.push("Điều kiện lặp cùng một sao.");
    if (p.stars.some((s) => !(s in STAR_VI)))
      errors.push("Điều kiện dùng sao chưa có trong danh mục.");
  } else if (p.kind !== "empty") {
    if (!(p.star in STAR_VI))
      errors.push("Điều kiện dùng sao chưa có trong danh mục.");
    if (p.kind === "hua" && !possibleHua.get(p.star)?.has(p.hua))
      errors.push("Tứ Hóa không tồn tại trong bảng thuật toán đã chọn.");
    if (
      p.kind === "brightness" &&
      (!["QS", "XD2"].includes(p.school) ||
        !p.values.length ||
        p.values.some(
          (v) =>
            !["庙", "旺", "得", "利", "平", "不", "闲", "陷", "地"].includes(v),
        ))
    )
      errors.push("Điều kiện độ sáng không hợp lệ.");
  }
  return errors;
}
export function ruleIssues(r: Rule): string[] {
  return [...r.conditions, ...r.exclude].flatMap(predicateIssues);
}
/** Catalogue coverage is NOT a proof that a chart has a complete interpretation. */
export function auditCatalogue(rules: Rule[]) {
  const major = [
    "紫微",
    "天机",
    "太阳",
    "武曲",
    "天同",
    "廉贞",
    "天府",
    "太阴",
    "贪狼",
    "巨门",
    "天相",
    "天梁",
    "七杀",
    "破军",
  ];
  const ids = new Set<string>();
  const issues: { id: string; messages: string[] }[] = [];
  for (const rule of rules) {
    const messages = ruleIssues(rule);
    if (ids.has(rule.id)) messages.push("ID quy tắc bị trùng.");
    ids.add(rule.id);
    if (messages.length) issues.push({ id: rule.id, messages });
  }
  const cells = Object.keys(PALACE_VI).flatMap((palace) =>
    major.map((star) => {
      const candidates = rules.filter(
        (r) =>
          r.kind === "interpretation" &&
          r.verification === "tested" &&
          contentReviewMatches(r) &&
          !ruleIssues(r).length &&
          r.conditions.some(
            (p) =>
              p.kind === "resident" &&
              p.palace === palace &&
              p.stars.includes(star),
          ),
      );
      return {
        palace,
        star,
        rules: candidates.map((r) => r.id),
        state: candidates.length
          ? "HAS_CONDITIONAL_RULES"
          : "NO_STRUCTURED_RULE",
      };
    }),
  );
  return {
    schemaVersion: "1",
    rules: rules.length,
    contentReview: {
      approved: rules.filter((r) => r.contentReview?.status === "approved")
        .length,
      held: rules.filter((r) => r.contentReview?.status !== "approved").length,
      independentReview: false,
    },
    issues,
    cells,
    totalCells: cells.length,
    cellsWithRules: cells.filter((c) => c.rules.length).length,
    complete: false,
    limitations: [
      "Một ô có quy tắc không có nghĩa đã phủ mọi tổ hợp sao, độ sáng và hội chiếu.",
      "Kiểm thử điều kiện hình thức không thay thế hiệu đính nguồn và bản dịch.",
      "Không dùng số lượng quy tắc hoặc kiến thức chung để tuyên bố đầy đủ cho mọi lá số.",
    ],
  };
}
