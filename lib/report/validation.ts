import { ruleIssues } from "./catalogue-audit";
import type { Assessment, ChartFacts, Predicate, Rule } from "./types";
import { palaceVi, starVi } from "./locale";
interface TestResult {
  result: "yes" | "no" | "unknown";
  evidence: string;
}
export function testPredicate(f: ChartFacts, c: Predicate): TestResult {
  if (c.kind === "unknown") return { result: "unknown", evidence: c.reason };
  const p = f.palaces.find((p) => p.name === c.palace);
  if (!p) return { result: "unknown", evidence: "Không có cung được yêu cầu." };
  const location = `${palaceVi(p.name)}@${p.branch}`;
  if (c.kind === "empty")
    return {
      result: p.isEmpty ? "yes" : "no",
      evidence: `empty:${location}=${!!p.isEmpty}`,
    };
  if (c.kind === "resident")
    return {
      result: c.stars.every((s) => p.stars.some((x) => x.name === s))
        ? "yes"
        : "no",
      evidence: `resident:${c.stars.map(starVi).join("+")}@${location}; thực có ${p.stars.map((s) => starVi(s.name)).join(", ")}`,
    };
  const star = f.stars[c.star];
  if (!star)
    return {
      result: "no",
      evidence: `Không có sao ${starVi(c.star)} trong lá số.`,
    };
  if (c.kind === "brightness") {
    if (c.school !== f.school)
      return {
        result: "unknown",
        evidence: `Bảng ${c.school} khác bảng ${f.school}, không trộn độ sáng.`,
      };
    if (!star.star.brightnessRaw)
      return { result: "unknown", evidence: "Chưa có độ sáng của sao." };
    return {
      result:
        star.branch === p.branch && c.values.includes(star.star.brightnessRaw)
          ? "yes"
          : "no",
      evidence: `brightness:${c.school}:${starVi(c.star)}@${star.branch}=${star.star.brightnessRaw}`,
    };
  }
  if (c.kind === "hua")
    return {
      result:
        star.branch === p.branch && star.star.siHua === c.hua ? "yes" : "no",
      evidence: `hua:${starVi(c.star)}@${star.branch}=${star.star.siHua ?? "không"}; yêu cầu ${c.hua}@${p.branch}`,
    };
  const ok =
    c.relation === "trine"
      ? p.trines.includes(star.branch)
      : c.relation === "opposite"
        ? p.opposite === star.branch
        : c.relation === "meeting"
          ? [p.branch, ...p.trines, p.opposite].includes(star.branch)
          : !!p.isEmpty &&
            p.borrowedStars?.includes(c.star) === true &&
            star.branch === p.opposite;
  return {
    result: ok ? "yes" : "no",
    evidence: `${c.relation}:${starVi(c.star)}@${star.branch} đối với ${location}`,
  };
}
export function validateRule(f: ChartFacts, r: Rule): Assessment {
  const evidence: string[] = [],
    reasons: string[] = [];
  if (r.kind === "reference")
    return {
      rule: r,
      status: "GENERAL_REFERENCE",
      evidence,
      reasons: ["Kiến thức chung, không đưa vào kết luận cá nhân."],
    };
  const catalogueErrors = ruleIssues(r);
  if (catalogueErrors.length)
    return {
      rule: r,
      status: "UNVERIFIED",
      evidence,
      reasons: catalogueErrors,
    };
  if (
    r.verification !== "tested" ||
    !r.source.original ||
    !r.source.locator ||
    r.conditions.length === 0
  )
    return {
      rule: r,
      status: "UNVERIFIED",
      evidence,
      reasons: ["Thiếu điều kiện hoặc nguồn được hình thức hóa."],
    };
  if (r.school !== "any" && r.school !== f.school)
    return {
      rule: r,
      status: "CONDITIONAL",
      evidence,
      reasons: [`Quy tắc dành cho ${r.school}, lá số dùng ${f.school}.`],
    };
  let unknown = false,
    contradicted = false;
  for (const c of r.conditions) {
    const t = testPredicate(f, c);
    evidence.push(t.evidence);
    if (t.result === "no") {
      contradicted = true;
      reasons.push("Không thỏa điều kiện: " + t.evidence);
    }
    if (t.result === "unknown") {
      unknown = true;
      reasons.push(t.evidence);
    }
  }
  for (const c of r.exclude) {
    const t = testPredicate(f, c);
    evidence.push("Loại trừ: " + t.evidence);
    if (t.result === "yes") {
      contradicted = true;
      reasons.push("Đã gặp điều kiện loại trừ.");
    }
    if (t.result === "unknown") unknown = true;
  }
  return {
    rule: r,
    status: contradicted
      ? "CONTRADICTED"
      : unknown
        ? "CONDITIONAL"
        : "APPLICABLE",
    evidence,
    reasons,
  };
}
export const validateRules = (f: ChartFacts, rules: Rule[]) =>
  rules.map((r) => validateRule(f, r));
