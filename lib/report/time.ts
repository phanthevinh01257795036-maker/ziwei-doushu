import moment from "moment-timezone";
import { lunarToSolar } from "../ziwei/lunar-solar";
import {
  calculateTrueSolarTime,
  isValidGregorianDate,
  resolveZiweiDayOffset,
  shiftGregorianDate,
  branchFromSolarMinutes,
} from "../ziwei/true-solar-time";
import type { BirthInput, NormalizedBirth, Notice } from "./types";
const int = (n: number, a: number, b: number) =>
  Number.isInteger(n) && n >= a && n <= b;
export const TIMEZONE_DATA_VERSION =
  "moment-timezone-0.6.0/tzdb-" + moment.tz.dataVersion;
function localParts(ms: number, zone: string): number[] {
  const offset = offsetAt(ms, zone);
  const date = new Date(ms + offset * 60000);
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ];
}
export function offsetAt(ms: number, zone: string): number {
  const data = moment.tz.zone(zone);
  if (!data) throw new Error("Múi giờ IANA không có trong bộ dữ liệu đã khóa.");
  return -data.utcOffset(ms);
}
/** Resolve a local clock with IANA data; explicitly reject skipped/repeated clocks. */
export function resolveCivil(
  y: number,
  m: number,
  d: number,
  h: number,
  mi: number,
  zone: string,
  manual?: number,
  choice?: "earlier" | "later",
) {
  const local = Date.UTC(y, m - 1, d, h, mi);
  if (zone === "manual") {
    if (manual === undefined || !int(manual, -840, 840))
      throw new Error("Cần nhập độ lệch múi giờ thủ công hợp lệ (phút).");
    return { utc: local - manual * 60000, offset: manual, ambiguous: false };
  }
  let offsets: Set<number>;
  try {
    offsets = new Set(
      [-36, -12, 0, 12, 36].map((hours) =>
        offsetAt(local + hours * 3600000, zone),
      ),
    );
  } catch {
    throw new Error(
      "Tên múi giờ IANA không hợp lệ hoặc bộ dữ liệu chưa hỗ trợ.",
    );
  }
  const expected = [y, m, d, h, mi, 0];
  const matches = [...offsets]
    .map((offset) => ({ utc: local - offset * 60000, offset }))
    .filter((x) => localParts(x.utc, zone).every((v, i) => v === expected[i]))
    .sort((a, b) => a.utc - b.utc);
  if (matches.length === 0)
    throw new Error(
      "Giờ dân dụng này không tồn tại trong múi giờ đã chọn (có thể do chuyển giờ mùa hè).",
    );
  if (matches.length > 1 && !choice)
    throw new Error(
      "Giờ này lặp lại khi đổi múi giờ. Hãy chọn lần sớm hoặc lần muộn.",
    );
  return {
    ...matches[choice === "later" ? matches.length - 1 : 0],
    ambiguous: matches.length > 1,
  };
}
export function normalizeBirth(input: BirthInput): NormalizedBirth {
  const i = {
    ...input,
    place: input.place.trim(),
    country: input.country.trim(),
  };
  if (!int(i.year, 1900, 2050) || !int(i.hour, 0, 23) || !int(i.minute, 0, 59))
    throw new Error("Năm phải từ 1900–2050, giờ 0–23, phút 0–59.");
  if (
    !["solar", "lunar"].includes(i.calendar) ||
    !["male", "female"].includes(i.gender)
  )
    throw new Error("Lịch hoặc giới tính lập lá số không hợp lệ.");
  if (
    !["QS", "XD2"].includes(i.school) ||
    !["next-day", "current-day"].includes(i.lateZi) ||
    !["split", "prev-month", "next-month", "origin-month"].includes(
      i.leapPolicy,
    )
  )
    throw new Error("Cấu hình trường phái không hợp lệ.");
  if (!i.place || i.place.length > 160 || !i.country || i.country.length > 80)
    throw new Error(
      "Cần nhập quốc gia và địa điểm sinh rõ ràng (có thể dùng tên cũ).",
    );
  if (!int(i.standardOffsetMinutes, -840, 840))
    throw new Error("Múi giờ chuẩn phải là số phút từ −840 đến 840.");
  if (i.targetYear !== undefined && !int(i.targetYear, 1900, 2200))
    throw new Error("Năm xem hạn phải từ 1900–2200.");
  if (
    i.longitude !== undefined &&
    (!Number.isFinite(i.longitude) || i.longitude < -180 || i.longitude > 180)
  )
    throw new Error("Kinh độ phải từ −180 đến 180.");
  if (i.solarCorrection && i.longitude === undefined)
    throw new Error(
      "Muốn hiệu chỉnh giờ mặt trời thực phải nhập kinh độ và xác nhận nguồn tọa độ.",
    );
  if (i.calendar === "solar" && i.leap)
    throw new Error("Tháng nhuận chỉ áp dụng lịch âm.");
  const civil =
    i.calendar === "lunar"
      ? lunarToSolar(i.year, i.month, i.day, i.leap)
      : { year: i.year, month: i.month, day: i.day };
  if (!civil || !isValidGregorianDate(civil.year, civil.month, civil.day))
    throw new Error(
      "Ngày không tồn tại; kiểm tra lịch, tháng nhuận và số ngày.",
    );
  const resolved = resolveCivil(
    civil.year,
    civil.month,
    civil.day,
    i.hour,
    i.minute,
    i.timeZone,
    i.manualOffsetMinutes,
    i.disambiguation,
  );
  // Convert actual clock to the chosen fixed standard clock, including date rollover.
  const std = new Date(resolved.utc + i.standardOffsetMinutes * 60000);
  const standardSolar = {
    year: std.getUTCFullYear(),
    month: std.getUTCMonth() + 1,
    day: std.getUTCDate(),
  };
  const correction = calculateTrueSolarTime({
    ...standardSolar,
    clockHour: std.getUTCHours(),
    clockMinute:
      std.getUTCMinutes() +
      std.getUTCSeconds() / 60 +
      std.getUTCMilliseconds() / 60000,
    longitude: i.solarCorrection ? i.longitude : undefined,
    utcOffsetMinutes: i.standardOffsetMinutes,
  });
  const chartDate = shiftGregorianDate(
    standardSolar,
    resolveZiweiDayOffset(correction, i.lateZi),
  );
  if (chartDate.year < 1900 || chartDate.year > 2050)
    throw new Error("Ngày sau hiệu chỉnh nằm ngoài phạm vi 1900–2050.");
  const notices: Notice[] = [
    {
      id: "place",
      text: "Địa danh được giữ nguyên như bạn nhập, gồm tên cũ. MVP chưa có cơ sở địa danh toàn quốc hoặc xác minh địa chỉ; hãy kiểm tra không nhầm nơi trùng tên.",
      confirm: true,
    },
    {
      id: "zone",
      text: `Xác nhận múi giờ ${i.timeZone}, độ lệch tại ngày sinh ${resolved.offset} phút, giờ chuẩn ${i.standardOffsetMinutes} phút. IANA đã khóa phiên bản ${TIMEZONE_DATA_VERSION}.`,
      confirm: true,
    },
  ];
  if (i.timeZone === "manual" || resolved.offset % 1 !== 0)
    notices.push({
      id: "historical",
      text: "Độ lệch thủ công hoặc lịch sử có độ chính xác dưới phút: cần xác nhận từ tài liệu giờ sinh; MVP chỉ nhận giờ sinh đến phút.",
      confirm: true,
    });
  if (
    (i.country === "Việt Nam" || i.timeZone === "Asia/Ho_Chi_Minh") &&
    civil.year < 1976
  )
    notices.push({
      id: "vietnam-history",
      text: "Việt Nam từng có các vùng dùng giờ khác nhau trước 1976. Asia/Ho_Chi_Minh không đại diện mọi địa phương lịch sử; cần kiểm tra tài liệu địa phương hoặc chọn độ lệch thủ công.",
      confirm: true,
    });
  const civilBranch = branchFromSolarMinutes(i.hour * 60 + i.minute);
  if (i.solarCorrection)
    notices.push({
      id: "longitude",
      text: `Kinh độ ${i.longitude}° do bạn cung cấp, chưa được hệ thống xác minh. Sai số gần ranh giới giờ có thể đổi lá số.`,
      confirm: true,
    });
  if (correction.branch !== civilBranch)
    notices.push({
      id: "branch-change",
      text: "Hiệu chỉnh đã làm đổi giờ địa chi so với giờ dân dụng. Chỉ lập lá số sau khi bạn chấp nhận thay đổi này.",
      confirm: true,
    });
  if (JSON.stringify(civil) !== JSON.stringify(chartDate))
    notices.push({
      id: "day-change",
      text: `Ngày lập lá số đổi thành ${chartDate.year}-${chartDate.month}-${chartDate.day} do giờ chuẩn/mặt trời thực/quy tắc Tý.`,
      confirm: true,
    });
  return {
    input: i,
    timeZoneVersion: TIMEZONE_DATA_VERSION,
    civilSolar: civil,
    standardSolar,
    actualOffsetMinutes: resolved.offset,
    civilUtc: new Date(resolved.utc).toISOString(),
    standardClock: `${String(std.getUTCHours()).padStart(2, "0")}:${String(std.getUTCMinutes()).padStart(2, "0")}:${String(std.getUTCSeconds()).padStart(2, "0")}`,
    correction,
    chartDate,
    civilBranch,
    branch: correction.branch,
    notices,
  };
}
export function requireAcknowledgements(n: NormalizedBirth, ids: string[]) {
  const missing = n.notices.filter((x) => x.confirm && !ids.includes(x.id));
  if (missing.length)
    throw new Error("Chưa xác nhận: " + missing.map((x) => x.text).join(" "));
}
