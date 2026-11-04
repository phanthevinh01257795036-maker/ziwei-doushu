import { mkdirSync, writeFileSync } from "node:fs";
import { RULES } from "../../content/vi/rules";
import { auditCatalogue } from "../../lib/report/catalogue-audit";
const audit = auditCatalogue(RULES);
mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/coverage-audit.json", JSON.stringify(audit, null, 2));
console.log(
  `${audit.cellsWithRules}/${audit.totalCells} ô chính tinh–cung có ít nhất một quy tắc; không có nghĩa là đã đầy đủ.`,
);
if (audit.issues.length) {
  console.error(audit.issues);
  process.exitCode = 1;
}
