# Kết quả kiểm chứng MVP

## Các giai đoạn đã hoàn thành trong phạm vi MVP

| Giai đoạn | Kết quả thực tế |
|---|---|
| 1. Khảo sát | AUDIT.md phân loại A/B/C/D; dùng lại bộ an sao gốc, không viết bộ an sao thay thế |
| 2. Dữ kiện và v4.0 | ChartFacts bất biến; 77 checksum khóa; chỉ đọc năm được yêu cầu; WebAssembly đọc luồng đã thử với tệp năm thật |
| 3. Logic | Năm trạng thái; điều kiện vị trí/quan hệ/Tứ Hóa/độ sáng; không xác thực bằng từ khóa |
| 4. Nội dung Việt | 30 quy tắc có nguồn, khử trùng lặp theo concept và ưu tiên biên tập; chưa dịch đầy đủ bản ghi v4.0 nào |
| 5. Giao diện/PDF | Trang Việt responsive, xác nhận giờ, sơ đồ, PDF/JSON/Markdown; gói tĩnh không backend |
| 6. Kiểm thử | TypeScript, bộ gốc, bộ MVP, dữ liệu thật, Chromium, PDF; có CI không triển khai |

## Đã chạy tại vùng làm việc

- Typecheck thành công; 17 tệp hồi quy gốc đạt, gồm bài kiểm 768 lá số. Hai bài kiểm dịch vụ cũ được chuyển sang kiểm hành vi không gọi mạng và cập nhật hai lá số khi sửa form.
- Các nhóm kiểm MVP: lịch/ngày/tháng nhuận, IANA/DST giờ lặp/mất, xác nhận tọa độ/múi giờ, ranh giờ/ngày, 12 cung/14 chính tinh/Tứ Hóa, quan hệ cung, các trạng thái, khử trùng lặp và tính tái lập. Thử nhiều cấu hình qua 36 hồ sơ tổng hợp ở cả QS và XD2.
- Hồ sơ riêng do chủ repository yêu cầu được kiểm bằng fixture ngoài checkout; không đưa ngày giờ/địa chỉ thật hoặc PDF cá nhân vào Git/artifact công khai. Xác nhận không áp quy tắc tọa Mệnh cho sao thực tại đối cung; Điền Trạch vô chính diệu không nhận sao đối cung thành sao tọa thủ.
- Tệp Release năm 2005 thật kiểm checksum, đọc được cửa sổ dài, tìm chính xác một bản ghi tổng hợp và đủ 13 nhóm; từ chối byte bị sửa. Bộ giải nén JavaScript ban đầu bị loại sau khi phát hiện sai byte; bản bàn giao dùng Zstandard 1.5.7 WebAssembly.
- Chromium: chạy dưới đường dẫn dự án, xác nhận thông tin, đủ 12 cung/14 mục, tải PDF thật, không tràn ngang ở chiều rộng 390px, nhập .zst vào Worker, không gửi yêu cầu ngoài trong luồng cơ bản/PDF/nhập tệp. Tải lại không giữ hồ sơ cá nhân.
- PDF mẫu tổng hợp: 23 trang A4, không trang trắng bất thường, không ký tự thay thế hoặc văn bản tràn khỏi trang. Kiểm độc lập bằng PyMuPDF/fontTools; cùng đầu vào/font cho cùng byte PDF. Có chặn xuất khi gặp ký tự font chưa hỗ trợ.

## GitHub runner

PR: https://github.com/phanthevinh01257795036-maker/ziwei-doushu/pull/1

Lần chạy đầu đã đạt: https://github.com/phanthevinh01257795036-maker/ziwei-doushu/actions/runs/41748372665

Bao gồm npm ci, typecheck, test:vi, **build Next.js giữ các route cũ**, build tĩnh, tệp Release thật và trình duyệt. Build Next.js ở sandbox cục bộ bị chặn tiến trình/cổng; runner GitHub thông thường đã xác nhận build thành công. Các lần chạy sau xem Checks của commit mới nhất. Không có bước triển khai hoặc merge.

## Chưa hoàn thành, không được coi là đã nghiệm thu đầy đủ

- Chưa có gazetteer Việt Nam cấp xã/huyện đầy đủ và lịch sử địa giới; kinh độ cần xác nhận thủ công.
- Chưa thẩm định chuyên môn toàn bộ nguồn cổ, chưa dịch toàn kho, chưa phủ mọi tổ hợp/cách cục và chủ đề.
- Chưa có quy tắc dự báo sự kiện đại hạn/lưu niên/tháng; hiện chỉ trình bày dữ kiện vận hạn được tính.
- Không bảo đảm đọc tệp năm trên mọi điện thoại yếu; có giới hạn RAM, timeout và lỗi minh bạch.
- Không coi tính đúng của phép trích xuất/quy tắc hình thức là bằng chứng khoa học cho dự đoán tử vi.
- Chưa triển khai website công khai vì chủ repository chưa cho phép. Bàn giao PR, gói tĩnh, hướng dẫn và PDF minh họa.
