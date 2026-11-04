import { Solar } from "lunar-javascript";
import { generateChart, setBrightnessSchool } from "../ziwei/algorithm";
import { getLiuNianSiHua } from "../ziwei/sihua";
import { normalizeBirth, requireAcknowledgements } from "./time";
import type { BirthInput, ChartFacts } from "./types";
export const ALGORITHM_VERSION =
  "upstream-a600484a49255039d0725f1ba9e11ca81a948f97+facts-1.0.0";
export const CONTENT_VERSION = "vi-rules-1.0.0";
function freeze<T>(v: T): T {
  if (v && typeof v === "object") {
    Object.values(v).forEach(freeze);
    Object.freeze(v);
  }
  return v;
}
export function buildFacts(input: BirthInput, acks: string[]): ChartFacts {
  const normalized = normalizeBirth(input);
  requireAcknowledgements(normalized, acks);
  const d = normalized.chartDate;
  // Upstream brightness selector is process-global: set for this synchronous call, restore on exit.
  let chart: ReturnType<typeof generateChart>;
  setBrightnessSchool(input.school);
  try {
    chart = generateChart(
      { ...d, hour: normalized.branch, gender: input.gender },
      { leapMonth: input.leapPolicy },
    );
  } finally {
    setBrightnessSchool("default");
  }
  if (
    chart.palaces.length !== 12 ||
    new Set(chart.palaces.map((p) => p.branch)).size !== 12
  )
    throw new Error("Lỗi cấu trúc: không đủ 12 cung độc nhất.");
  const palaces = chart.palaces
    .map((p) => {
      // Exclude upstream wall-clock-derived fields from the canonical facts.
      const { isCurrentDaXian: _, ...clean } = p;
      return {
        ...clean,
        trines: [(p.branch + 4) % 12, (p.branch + 8) % 12],
        opposite: (p.branch + 6) % 12,
        starRelations: {
          resident: p.stars.map((s) => s.name),
          borrowed: p.borrowedStars ?? [],
        },
      };
    })
    .sort((a, b) => a.branch - b.branch);
  const stars: ChartFacts["stars"] = {};
  for (const p of palaces)
    for (const star of p.stars) {
      if (stars[star.name]) throw new Error("Sao bị an trùng: " + star.name);
      stars[star.name] = {
        branch: p.branch,
        palace: p.name,
        star: { ...star },
      };
    }
  if (Object.values(stars).filter((s) => s.star.type === "major").length !== 14)
    throw new Error("Không đủ 14 chính tinh.");
  const year = input.targetYear;
  const nominalAge =
    year === undefined
      ? 0
      : year - Solar.fromYmd(d.year, d.month, d.day).getLunar().getYear() + 1;
  if (year !== undefined && nominalAge < 1)
    throw new Error("Năm xem hạn phải từ năm âm lịch sinh trở đi.");
  const raw = Solar.fromYmd(d.year, d.month, d.day).getLunar();
  const civil = normalized.civilSolar;
  const civilLunar = Solar.fromYmd(
    civil.year,
    civil.month,
    civil.day,
  ).getLunar();
  const facts: ChartFacts = {
    schemaVersion: "1",
    algorithmVersion: ALGORITHM_VERSION,
    contentVersion: CONTENT_VERSION,
    school: input.school,
    normalized,
    lunar: {
      ...chart.lunarInfo,
      lunarYear: raw.getYear(),
      lunarMonth: Math.abs(raw.getMonth()),
      lunarDay: raw.getDay(),
      isLeapMonth: raw.getMonth() < 0,
    },
    effectiveLunar: chart.lunarInfo,
    lunarCivil: {
      year: civilLunar.getYear(),
      month: Math.abs(civilLunar.getMonth()),
      day: civilLunar.getDay(),
      leap: civilLunar.getMonth() < 0,
    },
    ming: chart.mingGongBranch,
    shen: chart.shenGongBranch,
    ju: chart.wuxingJu,
    juName: chart.wuxingJuName,
    mingZhu: chart.mingZhu ?? "",
    shenZhu: chart.shenZhu ?? "",
    yinYangGender: chart.yinYangGender ?? "",
    ziwei: chart.ziweiPos,
    palaces,
    stars,
    sihua: palaces.flatMap((p) =>
      p.stars
        .filter((s) => s.siHua)
        .map((s) => ({
          star: s.name,
          hua: s.siHua!,
          branch: p.branch,
          palace: p.name,
        })),
    ),
    daxian: chart.daXians,
    period:
      year === undefined
        ? null
        : {
            year,
            nominalAge,
            daxianIndex: chart.daXians.findIndex(
              (x) => nominalAge >= x.startAge && nominalAge <= x.endAge,
            ),
            yearSihua: getLiuNianSiHua(year).transforms,
          },
    patterns: [],
  };
  // Only structural definitions tested here; no unverified auspiciousness is inferred.
  const ming = palaces.find((p) => p.branch === facts.ming)!;
  for (const [id, name, required] of [
    ["zi-fu", "Tử Phủ đồng cung tại Mệnh", ["紫微", "天府"]],
    ["chang-qu", "Xương Khúc đồng cung tại Mệnh", ["文昌", "文曲"]],
  ] as const) {
    if (required.every((s) => ming.stars.some((x) => x.name === s)))
      facts.patterns.push({
        id,
        name,
        evidence: required.map((s) => `resident:${s}@${ming.branch}`),
      });
  }
  return freeze(facts);
}
