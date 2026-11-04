# Kiến trúc MVP — không dịch vụ AI

```
BirthInput
  → normalizeBirth (lịch, giờ IANA/độ lệch thủ công, NOAA, Tý)
  → xác nhận từng Notice
  → buildFacts (generateChart gốc, bảng QS hoặc XD2)
  → ChartFacts bất biến, loại các trường phụ thuộc Date.now
  → validateRule (predicate cấu trúc, không dò từ khóa)
  → interpret (chọn APPLICABLE, ưu tiên theo concept, giữ khác biệt nguồn)
  → Report (nội dung Việt tĩnh)
  → PDF / Markdown / JSON trên trình duyệt
```

Nhánh tư liệu riêng: chartDate + branch + gender → khóa chính xác → manifest năm có checksum khóa phiên bản → tải riêng tệp nén (hoặc nhập tệp cục bộ) → WebCrypto SHA-256 → Worker Zstandard WebAssembly đọc luồng (@hpcc-js/wasm-zstd) → parser JSONL streaming → đúng một k và khớp y/m/d/h/g + 13 nhóm → receipt **UNVERIFIED**. Xác thực tệp không đồng nghĩa xác thực văn bản luận. Tư liệu không được ghi ngược vào ChartFacts, không tự trở thành kết luận cá nhân.

## Các tệp chính

- lib/report/time.ts: thời gian và xác nhận.
- lib/report/facts.ts: adapter duy nhất sang thuật toán gốc; đóng băng cấu trúc và quan hệ.
- lib/report/types.ts: hợp đồng ba tầng.
- content/vi/rules.ts: nguyên văn trích, bản Việt, nguồn, điều kiện, trạng thái, concept.
- lib/report/validation.ts: trạng thái APPLICABLE / CONDITIONAL / GENERAL_REFERENCE / CONTRADICTED / UNVERIFIED.
- lib/report/interpret.ts: tổng hợp xác định; không biến câu điều kiện thành sự kiện.
- lib/report/v4.ts, dataset-browser.ts, web/v4-worker.ts: đọc năm, kiểm SHA, cache dữ liệu nén công khai.
- lib/report/pdf.ts: jsPDF/AutoTable, font cùng nguồn, mục lục có số trang thật, phụ lục quy tắc và bảng sao.
- components/vi/ViApp.tsx: giao diện mặc định; web/main.tsx: entry tĩnh; app/page.tsx: entry Next.js.

## Tái lập

Không dùng đồng hồ, random hoặc lựa chọn văn bản ngẫu nhiên trong Report. Năm tham chiếu là đầu vào tùy chọn; bỏ trống thì không tạo ‘đại hạn hiện tại’. Tuổi mụ = năm âm lịch tham chiếu − năm âm lịch sinh + 1. PDF khóa ngày metadata và file ID để cùng nội dung/font cho cùng bytes. IANA khóa 2025b cùng moment-timezone 0.6.0; không phụ thuộc Intl của trình duyệt. Bản âm lịch thực được lưu riêng với tháng âm hiệu dụng theo quy tắc nhuận của thuật toán. So sánh/tổng hợp dựa ID và concept do biên tập, không dùng tương đồng từ khóa.

## Chi phí và giới hạn

Luồng Việt build ra `dist/`, chỉ cần static hosting HTTPS; không backend, không database, không API key, không phí suy luận. Trình duyệt vẫn cần tài nguyên CPU/RAM và mạng tải tệp công khai. Hosting miễn phí chịu quota/chính sách nhà cung cấp. Chưa triển khai bất kỳ dịch vụ nào.

Không đưa các tệp hàng trăm MB giải nén, hồ sơ, PDF, bản ghi cá nhân hoặc cache lên Git. Font tập con ~650 KB được phép phân phối theo OFL. Khi cập nhật nội dung phải kiểm font và tăng version. Luồng Việt không nhập toàn bộ UI cũ hoặc code dịch vụ. Trang cũ giữ khả năng lập/tra cứu nhưng không còn cuộc gọi suy luận.
