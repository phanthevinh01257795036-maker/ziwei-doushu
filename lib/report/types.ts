import type { LunarInfo, Palace, DaXian, Star } from "../ziwei/types";
import type { LunarMonthPolicy } from "../ziwei/algorithm";
export type Topic =
  | "overview"
  | "personality"
  | "learning"
  | "career"
  | "wealth"
  | "love"
  | "parents"
  | "family"
  | "children"
  | "friends"
  | "move"
  | "home"
  | "spirit"
  | "health";
export type Status =
  | "APPLICABLE"
  | "CONDITIONAL"
  | "GENERAL_REFERENCE"
  | "CONTRADICTED"
  | "UNVERIFIED";
export type School = "QS" | "XD2";
export interface BirthInput {
  year: number;
  month: number;
  day: number;
  calendar: "solar" | "lunar";
  leap: boolean;
  hour: number;
  minute: number;
  gender: "male" | "female";
  place: string;
  country: string;
  timeZone: string;
  manualOffsetMinutes?: number;
  standardOffsetMinutes: number;
  disambiguation?: "earlier" | "later";
  longitude?: number;
  solarCorrection: boolean;
  lateZi: "next-day" | "current-day";
  leapPolicy: LunarMonthPolicy;
  school: School;
  targetYear?: number;
}
export interface Notice {
  id: string;
  text: string;
  confirm: boolean;
}
export interface NormalizedBirth {
  input: BirthInput;
  timeZoneVersion: string;
  civilSolar: { year: number; month: number; day: number };
  standardSolar: { year: number; month: number; day: number };
  actualOffsetMinutes: number;
  civilUtc: string;
  standardClock: string;
  correction: ReturnType<
    typeof import("../ziwei/true-solar-time").calculateTrueSolarTime
  >;
  chartDate: { year: number; month: number; day: number };
  civilBranch: number;
  branch: number;
  notices: Notice[];
}
export interface FactPalace extends Omit<Palace, "isCurrentDaXian"> {
  trines: number[];
  opposite: number;
  starRelations: { resident: string[]; borrowed: string[] };
}
export interface ChartFacts {
  schemaVersion: "1";
  algorithmVersion: string;
  contentVersion: string;
  school: School;
  normalized: NormalizedBirth;
  lunar: LunarInfo;
  effectiveLunar: LunarInfo;
  lunarCivil: { year: number; month: number; day: number; leap: boolean };
  ming: number;
  shen: number;
  ju: number;
  juName: string;
  mingZhu: string;
  shenZhu: string;
  yinYangGender: string;
  ziwei: number;
  palaces: FactPalace[];
  stars: Record<string, { branch: number; palace: string; star: Star }>;
  sihua: { star: string; hua: string; branch: number; palace: string }[];
  daxian: DaXian[];
  period: {
    year: number;
    nominalAge: number;
    daxianIndex: number;
    yearSihua: Record<string, string>;
  } | null;
  patterns: { id: string; name: string; evidence: string[] }[];
}
export type Predicate =
  | { kind: "resident"; palace: string; stars: string[] }
  | { kind: "empty"; palace: string }
  | {
      kind: "brightness";
      palace: string;
      star: string;
      values: string[];
      school: School;
    }
  | { kind: "hua"; palace: string; star: string; hua: string }
  | {
      kind: "relation";
      palace: string;
      star: string;
      relation: "trine" | "opposite" | "meeting" | "borrowed";
    }
  | { kind: "unknown"; reason: string };
export interface Source {
  id: string;
  title: string;
  locator: string;
  original: string;
  license: "public-domain" | "CC-BY-4.0" | "editorial";
  url: string;
}
export interface Rule {
  id: string;
  topic: Topic;
  kind: "interpretation" | "pattern" | "reference";
  palaces: string[];
  stars: string[];
  source: Source;
  school: School | "any";
  conditions: Predicate[];
  exclude: Predicate[];
  textVi: string;
  translationStatus: "reviewed-static";
  verification: "tested" | "unverified";
  concept: string;
  priority: number;
  tone: "support" | "caution" | "neutral";
  conflictGroup?: string;
  note?: string;
}
export interface Assessment {
  rule: Rule;
  status: Status;
  evidence: string[];
  reasons: string[];
}
export interface ReportSection {
  id: Topic;
  title: string;
  facts: string[];
  paragraphs: {
    id: string;
    text: string;
    source: Source;
    evidence: string[];
    tone: string;
  }[];
  gap: string | null;
}
export interface Report {
  version: string;
  facts: ChartFacts;
  sections: ReportSection[];
  assessments: Assessment[];
  highlights: string[];
  tensions: string[];
  coverage: {
    rules: number;
    applicable: number;
    topicsWithText: number;
    topics: number;
    vietnameseDatasetRecords: number;
  };
  dataset: DatasetReceipt | null;
  limits: string[];
}
export interface V4Record {
  k: string;
  y: number;
  m: number;
  d: number;
  h: number;
  g: "male" | "female";
  ms: string | null;
  t: unknown;
  c: Record<string, string>;
}
export interface DatasetReceipt {
  release: "v4.0-13d";
  key: string;
  year: number;
  sha256: string;
  verified: true;
  sourceSchool: "XD2";
  contentVersion: string;
  record: V4Record;
  status: "UNVERIFIED";
  translation: "not-translated";
}
