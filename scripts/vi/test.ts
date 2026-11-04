import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { normalizeBirth, resolveCivil } from "../../lib/report/time";
import { buildFacts } from "../../lib/report/facts";
import { interpret, markdownReport } from "../../lib/report/interpret";
import {
  testPredicate,
  validateRule,
  validateRules,
} from "../../lib/report/validation";
import { RULES } from "../../content/vi/rules";
import {
  datasetIdentity,
  checkRecord,
  YearScanner,
  DIMENSIONS,
  extractYear,
  V4_MANIFEST,
} from "../../lib/report/v4";
import { renderPdf } from "../../lib/report/pdf";
import {
  lunarToSolar,
  leapMonthOfLunarYear,
} from "../../lib/ziwei/lunar-solar";
import type { BirthInput, Rule, ChartFacts } from "../../lib/report/types";
// Synthetic fixture, no real place name or personal report is stored in the repository.
const base: BirthInput = {
  year: 2000,
  month: 1,
  day: 1,
  calendar: "solar",
  leap: false,
  hour: 2,
  minute: 0,
  gender: "male",
  place: "Địa điểm kiểm thử tổng hợp",
  country: "Việt Nam",
  timeZone: "Asia/Ho_Chi_Minh",
  standardOffsetMinutes: 420,
  solarCorrection: false,
  lateZi: "next-day",
  leapPolicy: "split",
  school: "QS",
};
const facts = (x: Partial<BirthInput> = {}) => {
  const i = { ...base, ...x };
  const n = normalizeBirth(i);
  return buildFacts(
    i,
    n.notices.map((n) => n.id),
  );
};
let assertions = 0;
function test(name: string, fn: () => void) {
  fn();
  assertions++;
  console.log("✓ " + name);
}
test("Reject invalid Gregorian and lunar/leap dates", () => {
  for (const x of [
    { month: 2, day: 30 },
    { year: 2023, month: 2, day: 29 },
    { hour: 24 },
    { minute: 60 },
    { calendar: "solar", leap: true },
    { school: "bad" },
  ])
    assert.throws(() => normalizeBirth({ ...base, ...x } as BirthInput));
  assert.throws(() =>
    normalizeBirth({
      ...base,
      calendar: "lunar",
      year: 2024,
      month: 1,
      day: 1,
      leap: true,
    }),
  );
  const leap = leapMonthOfLunarYear(2023);
  assert.equal(leap, 2);
  assert(lunarToSolar(2023, 2, 1, true));
  assert(
    facts({ calendar: "lunar", year: 2023, month: 2, day: 1, leap: true }).lunar
      .isLeapMonth,
  );
});
test("IANA historical offset, DST gap and repeated time", () => {
  assert.equal(resolveCivil(2000, 1, 1, 12, 0, "Asia/Ho_Chi_Minh").offset, 420);
  assert.equal(
    resolveCivil(2020, 7, 1, 12, 0, "America/New_York").offset,
    -240,
  );
  assert.equal(
    resolveCivil(2020, 1, 1, 12, 0, "America/New_York").offset,
    -300,
  );
  assert.throws(() => resolveCivil(2020, 3, 8, 2, 30, "America/New_York"));
  assert.throws(() => resolveCivil(2020, 11, 1, 1, 30, "America/New_York"));
  assert.equal(
    resolveCivil(2020, 11, 1, 1, 30, "America/New_York", undefined, "later")
      .utc -
      resolveCivil(2020, 11, 1, 1, 30, "America/New_York", undefined, "earlier")
        .utc,
    3600000,
  );
});
test("Acknowledge location, timezone and solar changes", () => {
  assert.throws(() => buildFacts(base, []));
  assert.throws(() => normalizeBirth({ ...base, solarCorrection: true }));
  const n = normalizeBirth({
    ...base,
    hour: 3,
    minute: 0,
    solarCorrection: true,
    longitude: 102,
  });
  assert(n.notices.some((n) => n.id === "branch-change"));
  assert.equal(facts({ hour: 2, minute: 59 }).normalized.branch, 1);
  assert.equal(facts({ hour: 3, minute: 0 }).normalized.branch, 2);
  assert.equal(facts({ hour: 23, minute: 10 }).normalized.chartDate.day, 2);
  assert.equal(
    facts({ hour: 23, minute: 10, lateZi: "current-day" }).normalized.chartDate
      .day,
    1,
  );
  assert(
    normalizeBirth({ ...base, year: 1960 }).notices.some(
      (n) => n.id === "vietnam-history",
    ),
  );
});
const f = facts();
test("Immutable facts: 12 palaces, 14 majors, exact relations, no wall clock", () => {
  assert(Object.isFrozen(f));
  assert(Object.isFrozen(f.palaces[0].stars));
  assert.equal(f.palaces.length, 12);
  assert.equal(
    Object.values(f.stars).filter((s) => s.star.type === "major").length,
    14,
  );
  assert.equal(f.sihua.length, 4);
  assert(!("currentAge" in f));
  assert.equal(f.period, null);
  for (const p of f.palaces) {
    assert.equal(p.opposite, (p.branch + 6) % 12);
    assert.deepEqual(p.trines, [(p.branch + 4) % 12, (p.branch + 8) % 12]);
    assert(!("isCurrentDaXian" in p));
  }
  assert.deepEqual(f, facts());
});
test("Explicit status model, no keyword validation", () => {
  const r = RULES.find((r) => r.id === "career-fu")!;
  assert.equal(
    validateRule(f, { ...r, verification: "unverified" }).status,
    "UNVERIFIED",
  );
  assert.equal(
    validateRule(f, {
      ...r,
      conditions: [{ kind: "unknown", reason: "not checked" }],
    }).status,
    "CONDITIONAL",
  );
  assert.equal(
    validateRule(f, { ...r, kind: "reference" }).status,
    "GENERAL_REFERENCE",
  );
  assert.equal(validateRule(f, { ...r, school: "XD2" }).status, "CONDITIONAL");
  const p = f.palaces[0],
    star = p.stars[0];
  const resident: Rule = {
    ...r,
    conditions: [{ kind: "resident", palace: p.name, stars: [star.name] }],
  };
  assert.equal(validateRule(f, resident).status, "APPLICABLE");
  assert.equal(
    validateRule(f, { ...resident, exclude: resident.conditions }).status,
    "CONTRADICTED",
  );
  assert.equal(validateRule(f, { ...r, conditions: [] }).status, "UNVERIFIED");
  assert.equal(
    testPredicate(f, {
      kind: "brightness",
      palace: p.name,
      star: star.name,
      values: ["庙"],
      school: "XD2",
    }).result,
    "unknown",
  );
});
test("Malformed or impossible predicates never become personal conclusions", () => {
  const baseRule = RULES.find((r) => r.id === "career-fu")!;
  assert.equal(
    validateRule(f, {
      ...baseRule,
      conditions: [{ kind: "resident", palace: "命宫", stars: [] }],
    }).status,
    "UNVERIFIED",
  );
  for (const [star, hua] of [
    ["七杀", "禄"],
    ["天梁", "忌"],
  ])
    assert.equal(
      validateRule(f, {
        ...baseRule,
        conditions: [{ kind: "hua", palace: "命宫", star, hua }],
      }).status,
      "UNVERIFIED",
    );
  assert.equal(interpret(f).interpretationComplete, false);
});
test("Semantic dedup chooses authored priority, never adds text", () => {
  const p = f.palaces.find((p) => p.name === "命宫")!;
  const seed = RULES[0];
  const a: Rule = {
    ...seed,
    id: "low",
    topic: "overview",
    concept: "same",
    textVi: "Đoạn thấp",
    priority: 1,
    conditions: [
      { kind: "resident", palace: p.name, stars: [p.stars[0].name] },
    ],
  };
  const b = { ...a, id: "high", priority: 2, textVi: "Đoạn đầy đủ" };
  const report = interpret(f, null, [a, b]);
  assert.deepEqual(
    report.sections[0].paragraphs.map((x) => x.text),
    ["Đoạn đầy đủ"],
  );
});
test("Same profile produces byte-identical interpretation; source cannot move stars", () => {
  const a = interpret(f),
    b = interpret(facts());
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(markdownReport(a), markdownReport(b));
  for (const s of a.sections)
    for (const p of s.paragraphs)
      assert.equal(
        a.assessments.find((x) => x.rule.id === p.id)?.status,
        "APPLICABLE",
      );
  assert.equal(a.coverage.vietnameseDatasetRecords, 0);
});
test("v4 strict key, all fields, all dimensions, duplicate and missing records", () => {
  const id = datasetIdentity(f);
  const c = Object.fromEntries(
    DIMENSIONS.map((k) => [k, "Nguyên văn kiểm thử"]),
  );
  const record = {
    k: id.key,
    y: id.year,
    m: id.month,
    d: id.day,
    h: id.hour,
    g: id.gender,
    ms: null,
    t: {},
    c,
  };
  assert(checkRecord(record, id));
  assert.throws(() => checkRecord({ ...record, d: 2 }, id));
  assert.throws(() => checkRecord({ ...record, k: "nearest" }, id));
  assert.throws(() => checkRecord({ ...record, c: { overview: "x" } }, id));
  const bytes = new TextEncoder().encode(JSON.stringify(record) + "\n");
  const scan = new YearScanner(id);
  for (let i = 0; i < bytes.length; i += 7)
    scan.push(bytes.subarray(i, i + 7), i + 7 >= bytes.length);
  assert.equal(scan.finish().record.k, id.key);
  const dup = new YearScanner(id);
  dup.push(
    new TextEncoder().encode(
      JSON.stringify(record) + "\n" + JSON.stringify(record),
    ),
    true,
  );
  assert.throws(() => dup.finish());
  assert.throws(() => new YearScanner(id).finish());
});
test("A spread of charts preserves stars, brightness isolation and period facts", () => {
  for (const year of [1984, 1990, 2000])
    for (const month of [1, 6, 12])
      for (const hour of [0, 1, 6, 11]) {
        const a = facts({
          year,
          month,
          hour: hour * 2,
          gender: hour % 2 ? "female" : "male",
          targetYear: 2030,
        });
        const b = facts({
          year,
          month,
          hour: hour * 2,
          gender: hour % 2 ? "female" : "male",
          school: "XD2",
          targetYear: 2030,
        });
        assert.deepEqual(
          Object.entries(a.stars).map(([k, v]) => [k, v.branch]),
          Object.entries(b.stars).map(([k, v]) => [k, v.branch]),
        );
        assert(a.period);
        assert.equal(a.period.nominalAge, 2030 - a.lunar.lunarYear + 1);
        assert.equal(a.sihua.length, 4);
        assert.equal(new Set(a.palaces.map((p) => p.branch)).size, 12);
        validateRules(a, RULES);
      }
});
// Private regression requested by the owner: read only from an ignored external fixture.
if (process.env.PRIVATE_BIRTH_FIXTURE) {
  const i = JSON.parse(
    readFileSync(process.env.PRIVATE_BIRTH_FIXTURE, "utf8"),
  ) as BirthInput;
  const n = normalizeBirth(i);
  const pf = buildFacts(
    i,
    n.notices.map((n) => n.id),
  );
  test("Private regression: empty Ming/Home, no borrowed residents, QS/XD2", () => {
    assert.equal(pf.ming, 5);
    assert(pf.palaces.find((p) => p.name === "命宫")!.isEmpty);
    assert(pf.palaces.find((p) => p.name === "田宅")!.isEmpty);
    assert.equal(pf.stars["廉贞"].branch, 11);
    assert.equal(pf.stars["贪狼"].branch, 11);
    assert.equal(
      validateRule(pf, RULES.find((r) => r.id === "ming-lian-tan")!).status,
      "CONTRADICTED",
    );
    assert.equal(
      validateRule(pf, RULES.find((r) => r.id === "home-tong")!).status,
      "CONTRADICTED",
    );
    assert.equal(
      testPredicate(pf, {
        kind: "relation",
        palace: "命宫",
        star: "廉贞",
        relation: "borrowed",
      }).result,
      "yes",
    );
    assert.equal(
      testPredicate(pf, { kind: "resident", palace: "命宫", stars: ["廉贞"] })
        .result,
      "no",
    );
    const xd = buildFacts(
      { ...i, school: "XD2" },
      normalizeBirth({ ...i, school: "XD2" }).notices.map((n) => n.id),
    );
    assert.notEqual(
      xd.stars["七杀"].star.brightnessRaw,
      pf.stars["七杀"].star.brightnessRaw,
    );
  });
}
async function main() {
  await assert.rejects(extractYear(new ArrayBuffer(1), datasetIdentity(f)));
  const font = readFileSync("public/fonts/Report.ttf").toString("base64");
  const report = interpret(f);
  const pdf = renderPdf(report, font);
  assert.equal(Buffer.from(pdf).subarray(0, 5).toString(), "%PDF-");
  assert(pdf.length > 10000);
  assert.deepEqual(pdf, renderPdf(report, font));
  mkdirSync("artifacts", { recursive: true });
  writeFileSync("artifacts/bao-cao-minh-hoa.pdf", pdf);
  writeFileSync("artifacts/bao-cao-minh-hoa.md", markdownReport(report));
  writeFileSync(
    "artifacts/chart-facts-minh-hoa.json",
    JSON.stringify(f, null, 2),
  );
  console.log(
    `✓ PDF built deterministically (${pdf.length} bytes); ${assertions} test groups; ${Object.keys(V4_MANIFEST.years).length} pinned years`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
