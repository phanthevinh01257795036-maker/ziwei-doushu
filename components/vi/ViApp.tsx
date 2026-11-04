"use client";
import {
  MAJOR_GLOSSARY,
  MAJOR_GLOSSARY_NOTE,
} from "../../content/vi/major-glossary";
import React, { useState } from "react";
import { normalizeBirth } from "../../lib/report/time";
import { buildFacts } from "../../lib/report/facts";
import { interpret, markdownReport } from "../../lib/report/interpret";
import {
  BRANCHES_VI,
  BRIGHT_VI,
  HUA_VI,
  palaceVi,
  starVi,
  TOPICS,
} from "../../lib/report/locale";
import { datasetIdentity, V4_MANIFEST } from "../../lib/report/v4";
import {
  loadDataset,
  clearDatasetCache,
} from "../../lib/report/dataset-browser";
import type {
  BirthInput,
  NormalizedBirth,
  Report,
} from "../../lib/report/types";
import "./vi.css";
const initial: BirthInput = {
  year: 2000,
  month: 1,
  day: 1,
  calendar: "solar",
  leap: false,
  hour: 2,
  minute: 0,
  gender: "male",
  place: "",
  country: "Việt Nam",
  timeZone: "Asia/Ho_Chi_Minh",
  standardOffsetMinutes: 420,
  solarCorrection: false,
  lateZi: "next-day",
  leapPolicy: "split",
  school: "QS",
};
const oldPlaces = [
  "Hà Nội",
  "Thành phố Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
  "Bà Rịa – Vũng Tàu",
];
export default function ViApp({ assetBase = "/" }: { assetBase?: string }) {
  const [input, setInput] = useState<BirthInput>(initial),
    [normalized, setNormalized] = useState<NormalizedBirth | null>(null),
    [acks, setAcks] = useState<string[]>([]),
    [report, setReport] = useState<Report | null>(null),
    [error, setError] = useState(""),
    [progress, setProgress] = useState(""),
    [busy, setBusy] = useState(false),
    [datasetMessage, setDatasetMessage] = useState(""),
    [wantData, setWantData] = useState(false);
  const asset = (name: string) =>
    new URL(name, new URL(assetBase, window.location.href)).href;
  const update = (key: keyof BirthInput, value: unknown) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setNormalized(null);
    setAcks([]);
    setReport(null);
    setError("");
    setDatasetMessage("");
  };
  const numberField = (
    name: keyof BirthInput,
    label: string,
    min: number,
    max: number,
    optional = false,
  ) => (
    <label>
      {label}
      <input
        name={name}
        type="number"
        min={min}
        max={max}
        required={!optional}
        value={input[name] === undefined ? "" : String(input[name])}
        onChange={(e) =>
          update(
            name,
            e.target.value === "" ? undefined : Number(e.target.value),
          )
        }
      />
    </label>
  );
  const validate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReport(null);
    try {
      const n = normalizeBirth(input);
      setNormalized(n);
      setAcks([]);
      setTimeout(
        () =>
          document
            .getElementById("confirm-birth")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        0,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thông tin sinh không hợp lệ.");
    }
  };
  const generate = async () => {
    setBusy(true);
    setError("");
    setDatasetMessage("");
    setProgress("Đang chuẩn hóa ngày giờ và kiểm tra xác nhận…");
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const facts = buildFacts(input, acks);
      setProgress("Đã lập đủ 12 cung; đang kiểm tra từng quy tắc…");
      let result = interpret(facts);
      setReport(result);
      if (wantData) {
        try {
          const receipt = await loadDataset(
            facts,
            asset("v4-worker.js"),
            setProgress,
          );
          result = interpret(facts, receipt);
          setReport(result);
          setDatasetMessage(
            "Đã xác thực đúng bản ghi v4.0. Nội dung Trung văn chưa kiểm chứng/biên dịch toàn bộ, không ghép vào kết luận cá nhân.",
          );
        } catch (e) {
          setDatasetMessage(
            e instanceof Error ? e.message : "Chưa tải được tư liệu v4.0.",
          );
        }
      }
      setProgress("Hoàn tất kiểm tra và tổng hợp. Có thể tải PDF ngay.");
      setTimeout(
        () =>
          document
            .getElementById("report")
            ?.scrollIntoView({ behavior: "smooth" }),
        0,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lập báo cáo.");
    } finally {
      setBusy(false);
    }
  };
  const pdf = async () => {
    if (!report) return;
    setBusy(true);
    setError("");
    setProgress("Đang dàn trang A4 và nhúng font Việt–Hán trên thiết bị…");
    try {
      const { createPdf, downloadBytes } = await import("../../lib/report/pdf");
      const bytes = await createPdf(report, asset("fonts/Report.ttf"));
      downloadBytes(bytes, "bao-cao-tu-vi.pdf", "application/pdf");
      setProgress("PDF đã tạo xong và gửi tới trình tải tệp.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tạo PDF.");
    } finally {
      setBusy(false);
    }
  };
  const importData = async (file?: File) => {
    if (!report || !file) return;
    setBusy(true);
    setDatasetMessage("");
    try {
      const receipt = await loadDataset(
        report.facts,
        asset("v4-worker.js"),
        setProgress,
        file,
      );
      setReport(interpret(report.facts, receipt));
      setDatasetMessage(
        "Đã kiểm SHA-256 và đúng một bản ghi. Tư liệu giữ trạng thái chưa kiểm chứng, không thay thế quy tắc.",
      );
      setProgress("Đối chiếu v4.0 hoàn tất.");
    } catch (e) {
      setDatasetMessage(
        e instanceof Error ? e.message : "Không đọc được tệp năm.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="vi-app">
      <header className="vi-header">
        <a href="#" className="vi-brand">
          <span aria-hidden="true">紫</span>
          <div>
            TỬ VI <small>ĐẨU SỐ • TÀI NGUYÊN MỞ</small>
          </div>
        </a>
        <nav aria-label="Điều hướng">
          <a href="#birth">Lập lá số</a>
          <a href="#method">Phương pháp</a>
          <a href="#coverage">Độ bao phủ</a>
        </nav>
        <span className="vi-local">Xử lý trên thiết bị</span>
      </header>
      <main>
        <section className="vi-hero">
          <div>
            <p className="vi-eyebrow">
              THUẬT TOÁN RÕ RÀNG · LUẬN GIẢI CÓ NGUỒN
            </p>
            <h1>
              Một lá số.
              <br />
              <em>Một cách đọc cẩn trọng.</em>
            </h1>
            <p>
              Nhập thông tin sinh, xem 12 cung và tải báo cáo tiếng Việt. Mỗi
              nhận định được kiểm tra điều kiện trước khi xuất hiện.
            </p>
            <a href="#birth" className="vi-button">
              Bắt đầu lập lá số <span aria-hidden="true">→</span>
            </a>
            <p className="vi-fine">
              Không tài khoản. Không khóa API. Không dịch vụ AI.
            </p>
          </div>
          <div className="vi-hero-seal" aria-hidden="true">
            <div className="vi-orbit">命</div>
            <span>TỌA THỦ ≠ HỘI CHIẾU</span>
            <p>
              Dữ kiện trước.
              <br />
              Diễn giải sau.
            </p>
          </div>
        </section>
        <section className="vi-method" id="method">
          <div>
            <b>01</b>
            <h2>Đúng giờ, đúng ngày</h2>
            <p>
              Xác nhận địa điểm, múi giờ và quy tắc đổi ngày. Không mặc định giờ
              Bắc Kinh cho Việt Nam.
            </p>
          </div>
          <div>
            <b>02</b>
            <h2>Đúng sao, đúng cung</h2>
            <p>
              Dùng bộ an sao hiện có. Sao đối cung không trở thành sao tọa thủ.
            </p>
          </div>
          <div>
            <b>03</b>
            <h2>Chỉ luận khi đủ điều kiện</h2>
            <p>
              Chọn nội dung Việt tĩnh có nguồn; chỗ chưa đủ quy tắc được ghi rõ.
            </p>
          </div>
        </section>
        <div className="vi-workspace" id="birth">
          <section className="vi-card vi-form-card">
            <div className="vi-section-head">
              <p className="vi-eyebrow">HỒ SƠ LÁ SỐ</p>
              <h2>Thông tin sinh</h2>
              <p>
                Điền theo giấy tờ hoặc thông tin đã xác minh. Tên địa phương cũ
                có thể nhập nguyên văn.
              </p>
            </div>
            <form onSubmit={validate}>
              <fieldset disabled={busy}>
                <legend>Ngày và giờ</legend>
                <div className="vi-fields three">
                  {numberField("day", "Ngày", 1, 31)}
                  {numberField("month", "Tháng", 1, 12)}
                  {numberField("year", "Năm", 1900, 2050)}
                </div>
                <div className="vi-fields">
                  <label>
                    Loại lịch
                    <select
                      name="calendar"
                      value={input.calendar}
                      onChange={(e) => {
                        setInput((prev) => ({
                          ...prev,
                          calendar: e.target.value as BirthInput["calendar"],
                          leap: false,
                        }));
                        setNormalized(null);
                        setReport(null);
                        setAcks([]);
                      }}
                    >
                      <option value="solar">Dương lịch</option>
                      <option value="lunar">
                        Âm lịch (theo lịch thư viện)
                      </option>
                    </select>
                  </label>
                  <label>
                    Giới tính lập lá số
                    <select
                      name="gender"
                      value={input.gender}
                      onChange={(e) => update("gender", e.target.value)}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </label>
                </div>
                {input.calendar === "lunar" && (
                  <label className="vi-check">
                    <input
                      type="checkbox"
                      checked={input.leap}
                      onChange={(e) => update("leap", e.target.checked)}
                    />
                    Tháng nhuận âm lịch (sẽ kiểm tra có tồn tại)
                  </label>
                )}
                <div className="vi-fields">
                  {numberField("hour", "Giờ dân dụng", 0, 23)}
                  {numberField("minute", "Phút", 0, 59)}
                </div>
              </fieldset>
              <fieldset disabled={busy}>
                <legend>Địa điểm và múi giờ</legend>
                <label>
                  Nơi sinh — xã/phường, huyện/quận, tỉnh/thành
                  <input
                    name="place"
                    value={input.place}
                    list="old-places"
                    maxLength={160}
                    placeholder="Nhập rõ địa danh, có thể dùng tên cũ"
                    required
                    onChange={(e) => update("place", e.target.value)}
                  />
                  <datalist id="old-places">
                    {oldPlaces.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </label>
                <p className="vi-fine">
                  Gợi ý tên tỉnh không phải xác minh địa chỉ. Không tự chọn khi
                  có nơi trùng tên.
                </p>
                <div className="vi-fields">
                  <label>
                    Quốc gia
                    <input
                      name="country"
                      value={input.country}
                      maxLength={80}
                      required
                      onChange={(e) => update("country", e.target.value)}
                    />
                  </label>
                  <label>
                    Múi giờ theo địa phương
                    <select
                      name="timeZone"
                      value={input.timeZone}
                      onChange={(e) => update("timeZone", e.target.value)}
                    >
                      <option value="Asia/Ho_Chi_Minh">
                        Việt Nam — Asia/Ho_Chi_Minh
                      </option>
                      <option value="Asia/Bangkok">
                        Thái Lan — Asia/Bangkok
                      </option>
                      <option value="Asia/Shanghai">
                        Trung Quốc — Asia/Shanghai
                      </option>
                      <option value="Asia/Tokyo">Nhật Bản — Asia/Tokyo</option>
                      <option value="America/New_York">
                        Hoa Kỳ — America/New_York
                      </option>
                      <option value="Europe/Paris">Pháp — Europe/Paris</option>
                      <option value="manual">Nhập độ lệch thủ công</option>
                    </select>
                  </label>
                </div>
                {input.timeZone === "manual" &&
                  numberField(
                    "manualOffsetMinutes",
                    "Độ lệch dân dụng so với UTC (phút, ví dụ +420)",
                    -840,
                    840,
                  )}
                {numberField(
                  "standardOffsetMinutes",
                  "Độ lệch giờ chuẩn (phút, Việt Nam +420)",
                  -840,
                  840,
                )}
                <p className="vi-fine">
                  Giờ chuẩn dùng để hiệu chỉnh mặt trời. Khi đổi quốc gia, hãy
                  kiểm tra giá trị này; IANA xác định độ lệch dân dụng theo
                  ngày.
                </p>
                <label className="vi-check">
                  <input
                    type="checkbox"
                    checked={input.solarCorrection}
                    onChange={(e) =>
                      update("solarCorrection", e.target.checked)
                    }
                  />
                  Hiệu chỉnh giờ mặt trời thực theo kinh độ
                </label>
                {input.solarCorrection && (
                  <label>
                    Kinh độ (đông dương, tây âm)
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      required
                      value={input.longitude ?? ""}
                      onChange={(e) =>
                        update(
                          "longitude",
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                    <span className="vi-fine">
                      Lấy từ tọa độ địa điểm đã xác minh; không dùng tỉnh khác
                      thay thế. Hệ thống chưa có bộ tra tọa độ toàn quốc.
                    </span>
                  </label>
                )}
              </fieldset>
              <details className="vi-settings">
                <summary>Tùy chọn trường phái và năm xem hạn</summary>
                <div className="vi-fields">
                  <label>
                    Quy tắc Tý muộn
                    <select
                      name="lateZi"
                      value={input.lateZi}
                      onChange={(e) => update("lateZi", e.target.value)}
                    >
                      <option value="next-day">
                        23:00–23:59 sang ngày tiếp theo
                      </option>
                      <option value="current-day">Giữ ngày hiện tại</option>
                    </select>
                  </label>
                  <label>
                    Bảng độ sáng
                    <select
                      name="school"
                      value={input.school}
                      onChange={(e) => update("school", e.target.value)}
                    >
                      <option value="QS">QS — Toàn Thư (mặc định)</option>
                      <option value="XD2">XD2 — hiện đại hiệu chỉnh v2</option>
                    </select>
                  </label>
                  <label>
                    Tháng nhuận
                    <select
                      name="leapPolicy"
                      value={input.leapPolicy}
                      onChange={(e) => update("leapPolicy", e.target.value)}
                    >
                      <option value="split">
                        Chia đôi theo ngày (mặc định)
                      </option>
                      <option value="prev-month">Theo tháng hiện tại</option>
                      <option value="next-month">Theo tháng kế tiếp</option>
                      <option value="origin-month">Giữ tháng nhuận</option>
                    </select>
                  </label>
                  <label>
                    Giờ lặp do đổi giờ
                    <select
                      name="disambiguation"
                      value={input.disambiguation ?? ""}
                      onChange={(e) =>
                        update("disambiguation", e.target.value || undefined)
                      }
                    >
                      <option value="">Yêu cầu xác nhận nếu bị lặp</option>
                      <option value="earlier">Chọn lần sớm</option>
                      <option value="later">Chọn lần muộn</option>
                    </select>
                  </label>
                  {numberField(
                    "targetYear",
                    "Năm âm lịch xem hạn (có thể bỏ trống)",
                    1900,
                    2200,
                    true,
                  )}
                </div>
                <p className="vi-fine">
                  Chỉ xuất dữ kiện đại hạn/Tứ Hóa năm; chưa dự báo sự kiện theo
                  năm hoặc tháng.
                </p>
              </details>
              <button
                className="vi-button vi-wide"
                type="submit"
                disabled={busy}
              >
                Kiểm tra thông tin sinh <span aria-hidden="true">→</span>
              </button>
            </form>
          </section>
          <aside className="vi-sidebar">
            <section className="vi-card" id="coverage">
              <p className="vi-eyebrow">MINH BẠCH TỪ ĐẦU</p>
              <h2>Bản MVP có gì?</h2>
              <ul>
                <li>Bộ lập lá số và bảng sao gốc.</li>
                <li>Quy tắc Việt tĩnh, kiểm tra từng điều kiện.</li>
                <li>Báo cáo PDF A4, JSON và Markdown.</li>
                <li>Đối chiếu riêng một năm dữ liệu v4.0.</li>
              </ul>
              <div className="vi-note">
                <b>Chưa phủ mọi lá số.</b>
                <p>
                  Chưa có bản dịch Việt hoàn chỉnh của kho v4.0. Các chủ đề
                  thiếu quy tắc sẽ chỉ hiện dữ kiện. Không dùng văn bản tự do
                  làm kết luận cá nhân.
                </p>
              </div>
            </section>
            <section className="vi-card">
              <h3>Quyền riêng tư</h3>
              <p>
                Thông tin sinh và báo cáo nằm trong bộ nhớ trình duyệt. Không
                gửi dữ liệu sinh lên máy chủ, không lưu vào URL và không theo
                dõi người dùng.
              </p>
              <p>
                Chỉ tệp năm dữ liệu công khai có thể lưu cache trên thiết bị.
              </p>
              <button
                type="button"
                className="vi-text-button"
                onClick={async () => {
                  await clearDatasetCache();
                  setProgress("Đã xóa cache dữ liệu năm trên thiết bị.");
                }}
              >
                Xóa cache dữ liệu v4.0
              </button>
            </section>
          </aside>
        </div>
        {error && (
          <div className="vi-error" role="alert">
            {error}
          </div>
        )}
        {normalized && !report && (
          <section id="confirm-birth" className="vi-card vi-confirm">
            <p className="vi-eyebrow">BƯỚC XÁC NHẬN</p>
            <h2>Kiểm tra trước khi lập lá số</h2>
            <p>
              Giờ dân dụng: {BRANCHES_VI[normalized.civilBranch]}. Sau chuẩn
              hóa: <b>{BRANCHES_VI[normalized.branch]}</b>, ngày lập lá số{" "}
              <b>
                {normalized.chartDate.day}/{normalized.chartDate.month}/
                {normalized.chartDate.year}
              </b>
              .{" "}
              {input.solarCorrection
                ? `Giờ mặt trời thực ${normalized.correction.hour}:${String(normalized.correction.minute).padStart(2, "0")}:${String(normalized.correction.second).padStart(2, "0")}.`
                : "Không hiệu chỉnh giờ mặt trời thực."}
            </p>
            {normalized.notices.map((n) => (
              <label className="vi-check vi-confirm-item" key={n.id}>
                <input
                  type="checkbox"
                  checked={acks.includes(n.id)}
                  onChange={(e) =>
                    setAcks((prev) =>
                      e.target.checked
                        ? [...prev, n.id]
                        : prev.filter((x) => x !== n.id),
                    )
                  }
                />
                {n.text}
              </label>
            ))}
            <label className="vi-check">
              <input
                type="checkbox"
                checked={wantData}
                onChange={(e) => setWantData(e.target.checked)}
              />
              Đối chiếu tư liệu v4.0 (tùy chọn; giải nén một năm có thể cần
              khoảng 128 MB RAM hoặc hơn)
            </label>
            <button
              type="button"
              className="vi-button"
              disabled={
                busy ||
                normalized.notices.some(
                  (n) => n.confirm && !acks.includes(n.id),
                )
              }
              onClick={generate}
            >
              Lập lá số và tạo báo cáo
            </button>
          </section>
        )}
        {progress && (
          <div className="vi-progress" role="status" aria-live="polite">
            {busy && <span className="vi-spinner" />}
            {progress}
          </div>
        )}
        {report && (
          <section id="report" className="vi-report">
            <div className="vi-report-header">
              <div>
                <p className="vi-eyebrow">
                  LÁ SỐ ĐÃ LẬP • BẢNG {report.facts.school}
                </p>
                <h2>Báo cáo của bạn</h2>
                <p className="vi-note">
                  Bản nội dung chưa đầy đủ. Số chủ đề có nhận định không phải tỷ
                  lệ luận giải hoàn chỉnh. Các đoạn kiến thức chung không được
                  tính thành kết luận cá nhân.
                </p>
                <p>
                  {report.coverage.topicsWithText}/{report.coverage.topics} chủ
                  đề có nhận định khớp điều kiện · {report.coverage.applicable}/
                  {report.coverage.rules} quy tắc phù hợp.
                </p>
              </div>
              <div className="vi-export">
                <button
                  className="vi-button"
                  type="button"
                  disabled={busy}
                  onClick={pdf}
                >
                  Tải báo cáo PDF ↓
                </button>
                <button
                  type="button"
                  className="vi-secondary"
                  onClick={async () => {
                    const { downloadBytes } = await import(
                      "../../lib/report/pdf"
                    );
                    downloadBytes(
                      JSON.stringify(report.facts, null, 2),
                      "chart-facts.json",
                      "application/json",
                    );
                  }}
                >
                  JSON dữ kiện
                </button>
                <button
                  type="button"
                  className="vi-secondary"
                  onClick={async () => {
                    const { downloadBytes } = await import(
                      "../../lib/report/pdf"
                    );
                    downloadBytes(
                      markdownReport(report),
                      "bao-cao.md",
                      "text/markdown;charset=utf-8",
                    );
                  }}
                >
                  Markdown
                </button>
              </div>
            </div>
            <div className="vi-chart" aria-label="Sơ đồ 12 cung">
              {[
                5,
                6,
                7,
                8,
                4,
                null,
                null,
                9,
                3,
                null,
                null,
                10,
                2,
                1,
                0,
                11,
              ].map((branch, index) =>
                branch === null ? (
                  <div
                    key={"gap" + index}
                    className="vi-chart-gap"
                    aria-hidden="true"
                  >
                    {index === 5 ? (
                      <>
                        <b>命</b>
                        <span>Mệnh • Thân • Cục</span>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div
                    key={branch}
                    className={
                      "vi-palace " +
                      (branch === report.facts.ming ? "is-ming" : "")
                    }
                  >
                    <header>
                      <b>
                        {palaceVi(
                          report.facts.palaces.find((p) => p.branch === branch)!
                            .name,
                        )}
                      </b>
                      <span>{BRANCHES_VI[branch]}</span>
                    </header>
                    {report.facts.palaces.find((p) => p.branch === branch)!
                      .isEmpty && <em>Vô chính diệu</em>}
                    {report.facts.palaces
                      .find((p) => p.branch === branch)!
                      .stars.map((s) => (
                        <p
                          className={s.type === "major" ? "vi-major" : ""}
                          key={s.name}
                        >
                          {starVi(s.name)}{" "}
                          {s.siHua && <strong>{HUA_VI[s.siHua]}</strong>}{" "}
                          {s.brightnessRaw && (
                            <small>
                              {BRIGHT_VI[s.brightnessRaw] ?? s.brightnessRaw}
                            </small>
                          )}
                        </p>
                      ))}
                    {branch === report.facts.shen && (
                      <span className="vi-tag">Thân cư</span>
                    )}
                  </div>
                ),
              )}
            </div>
            <nav className="vi-topic-nav" aria-label="Các mục luận giải">
              {TOPICS.map(([id, title]) => (
                <a key={id} href={"#topic-" + id}>
                  {title}
                </a>
              ))}
            </nav>
            {report.sections.map((s) => (
              <article
                className="vi-card vi-topic"
                id={"topic-" + s.id}
                key={s.id}
              >
                <h3>{s.title}</h3>
                <div className="vi-fact-lines">
                  {s.facts.map((x) => (
                    <p key={x}>{x}</p>
                  ))}
                </div>
                {s.paragraphs.map((p) => (
                  <div key={p.id} className="vi-interpretation">
                    <p>{p.text}</p>
                    <details>
                      <summary>Dữ kiện và nguồn [{p.id}]</summary>
                      <p>
                        {p.source.title} · {p.source.locator}
                      </p>
                      <p>Nguyên văn: {p.source.original}</p>
                      <p>
                        Duyệt nội dung: {p.review?.note ?? "Chưa có biên bản"}{" "}
                        Chưa có hiệu đính độc lập.
                      </p>
                      <ul>
                        {p.evidence.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                      <a
                        href={
                          p.source.url.startsWith("http")
                            ? p.source.url
                            : "https://github.com/phanthevinh01257795036-maker/ziwei-doushu/tree/feat/vietnamese-deterministic-reports/docs/vi"
                        }
                        rel="noreferrer"
                        target="_blank"
                      >
                        Xem nguồn
                      </a>
                    </details>
                  </div>
                ))}
                {s.gap && <p className="vi-note">{s.gap}</p>}
              </article>
            ))}
            <article className="vi-card vi-topic">
              <h3>Đại hạn và năm được chọn</h3>
              {report.facts.period ? (
                <p>
                  Năm âm lịch {report.facts.period.year},{" "}
                  {report.facts.period.nominalAge} tuổi mụ.{" "}
                  {report.facts.period.daxianIndex < 0
                    ? "Ngoài các đại hạn được liệt kê."
                    : `Đại hạn tại ${palaceVi(report.facts.daxian[report.facts.period.daxianIndex].palaceName)}.`}
                </p>
              ) : (
                <p>
                  Chưa chọn năm tham chiếu. Không tự lấy đồng hồ hệ thống để kết
                  luận vận hiện tại.
                </p>
              )}
              <div className="vi-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Tuổi mụ</th>
                      <th>Cung</th>
                      <th>Năm âm lịch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.facts.daxian.map((dx) => (
                      <tr key={dx.startAge}>
                        <td>
                          {dx.startAge}–{dx.endAge}
                        </td>
                        <td>{palaceVi(dx.palaceName)}</td>
                        <td>
                          {report.facts.lunar.lunarYear + dx.startAge - 1}–
                          {report.facts.lunar.lunarYear + dx.endAge - 1}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="vi-note">
                Chưa có quy tắc dự báo sự kiện năm/tháng. Tứ Hóa năm được lưu
                riêng trong JSON và PDF khi có năm chọn.
              </p>
            </article>
            <article className="vi-card vi-topic">
              <h3>Tư liệu v4.0 và giới hạn</h3>
              <details>
                <summary>
                  Từ khóa Việt–Trung của 14 chính tinh — kiến thức chung
                </summary>
                <p>{MAJOR_GLOSSARY_NOTE}</p>
                <ul>
                  {MAJOR_GLOSSARY.map((s) => (
                    <li key={s.star}>
                      <b>{s.nameVi}</b>: {s.textVi} ({s.original})
                    </li>
                  ))}
                </ul>
              </details>
              {datasetMessage && (
                <p role="status" className="vi-note">
                  {datasetMessage}
                </p>
              )}
              <p>
                Khóa cần tìm: <code>{datasetIdentity(report.facts).key}</code>.
                Nguồn dùng bảng XD2; báo cáo này dùng {report.facts.school}.
                Không ghép hai bảng vào một nhận định.
              </p>
              {(() => {
                const year = datasetIdentity(report.facts).year;
                const file =
                  V4_MANIFEST.years[
                    String(year) as keyof typeof V4_MANIFEST.years
                  ];
                return file ? (
                  <>
                    <a href={file.url} target="_blank" rel="noreferrer">
                      Tải riêng {file.file} từ Release
                    </a>
                    <label className="vi-file">
                      Chọn tệp năm đã tải để đối chiếu
                      <input
                        aria-label="Nhập tệp dữ liệu năm v4"
                        type="file"
                        accept=".zst"
                        disabled={busy}
                        onChange={(e) => importData(e.target.files?.[0])}
                      />
                    </label>
                  </>
                ) : (
                  <p>
                    Năm này không có trong v4.0; không dùng năm hoặc ngày gần
                    nhất thay thế.
                  </p>
                );
              })()}
              {report.dataset && (
                <details>
                  <summary>
                    Nguyên văn Trung văn — CHƯA KIỂM CHỨNG, không phải kết luận
                    cá nhân
                  </summary>
                  <p>
                    SHA-256: {report.dataset.sha256}. Đúng k/y/m/d/h/g; 13 nhóm.
                    Chưa có bản dịch Việt đầy đủ cho bản ghi này.
                  </p>
                  {Object.entries(report.dataset.record.c).map(([k, v]) => (
                    <details key={k}>
                      <summary>
                        {TOPICS.find(([id]) => id === k)?.[1] ?? k}
                      </summary>
                      <pre>{v}</pre>
                    </details>
                  ))}
                </details>
              )}
              <ul>
                {report.limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <details>
                <summary>Nhận định bị loại và lý do</summary>
                {report.assessments
                  .filter((a) => a.status !== "APPLICABLE")
                  .map((a) => (
                    <p key={a.rule.id}>
                      <code>{a.rule.id}</code> · {a.status}:{" "}
                      {a.reasons.join("; ")}
                    </p>
                  ))}
              </details>
            </article>
          </section>
        )}
      </main>
      <footer className="vi-footer">
        <p>
          TỬ VI ĐẨU SỐ · Tài liệu tham khảo văn hóa, không quyết định thay bạn.
        </p>
        <p>
          Mã nguồn MIT · Dữ liệu v4.0 CC BY 4.0, 王多鱼AI / Renhuai123 · Tài
          nguyên Việt MVP có độ bao phủ giới hạn.
        </p>
        <a
          href="https://github.com/phanthevinh01257795036-maker/ziwei-doushu"
          target="_blank"
          rel="noreferrer"
        >
          Mã nguồn và hướng dẫn sử dụng
        </a>
      </footer>
    </div>
  );
}
