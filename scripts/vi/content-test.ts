import { CONTENT_REVIEW, contentReviewMatches } from "../../content/vi/review";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RULES } from "../../content/vi/rules";
import { MAJOR_GLOSSARY } from "../../content/vi/major-glossary";
import { STAR_DESCRIPTIONS } from "../../lib/ziwei/constants";
import {
  auditCatalogue,
  predicateIssues,
  ruleIssues,
} from "../../lib/report/catalogue-audit";
import type { Rule } from "../../lib/report/types";
const audit = auditCatalogue(RULES);
assert.deepEqual(audit.issues, []);
assert.equal(audit.totalCells, 168);
assert.equal(audit.complete, false);
assert(audit.cellsWithRules > 0 && audit.cellsWithRules < 168);
assert.equal(
  auditCatalogue([...RULES, RULES[0]]).issues.some((x) =>
    x.messages.some((s) => s.includes("trùng")),
  ),
  true,
);
for (const [star, hua] of [
  ["天梁", "忌"],
  ["七杀", "禄"],
  ["七杀", "权"],
  ["天府", "忌"],
])
  assert(
    predicateIssues({ kind: "hua", palace: "命宫", star, hua }).length > 0,
  );
assert.deepEqual(
  predicateIssues({ kind: "hua", palace: "父母", star: "天机", hua: "禄" }),
  [],
);
assert(
  predicateIssues({ kind: "resident", palace: "命宫", stars: [] }).length > 0,
);
assert(
  predicateIssues({ kind: "resident", palace: "命宫", stars: ["天机", "天机"] })
    .length > 0,
);
assert(
  predicateIssues({ kind: "resident", palace: "không có", stars: ["天机"] })
    .length > 0,
);
assert(
  predicateIssues({
    kind: "brightness",
    palace: "命宫",
    star: "天机",
    school: "QS",
    values: [],
  }).length > 0,
);
assert.equal(MAJOR_GLOSSARY.length, 14);
assert.equal(new Set(MAJOR_GLOSSARY.map((x) => x.star)).size, 14);
for (const item of MAJOR_GLOSSARY) {
  assert.equal(item.original, STAR_DESCRIPTIONS[item.star].keywords);
  assert(item.textVi.trim());
}
const invalid = {
  ...RULES[0],
  conditions: [{ kind: "hua", palace: "命宫", star: "七杀", hua: "禄" }],
} as Rule;
assert(ruleIssues(invalid).length > 0);
const legacy = readFileSync("components/StarDetailPanel.tsx", "utf8");
assert(!legacy.includes("天梁最怕化忌"));
assert(!legacy.includes("七杀化禄后反为吉"));

// All current IDs have explicit manual review; being mentioned in a source is not approval.

assert.deepEqual(
  Object.keys(CONTENT_REVIEW).sort(),
  RULES.map((r) => r.id).sort(),
);
assert.equal(
  RULES.filter((r) => r.contentReview?.status === "approved").length,
  11,
);
assert.equal(
  RULES.filter((r) => r.contentReview?.status === "hold").length,
  19,
);
for (const rule of RULES) {
  assert.equal(
    contentReviewMatches(rule),
    rule.contentReview?.status === "approved",
    rule.id,
  );
  if (rule.contentReview?.status === "approved") {
    assert.equal(
      contentReviewMatches({ ...rule, textVi: rule.textVi + " thay đổi" }),
      false,
    );
    assert.equal(
      contentReviewMatches({
        ...rule,
        source: { ...rule.source, original: "khác" },
      }),
      false,
    );
  }
}

console.log(
  `Content audit passed: ${audit.cellsWithRules}/168 cells have conditional rules; 14 glossary entries are references, not personal interpretations.`,
);
