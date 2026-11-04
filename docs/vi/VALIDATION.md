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

## Bổ sung kiểm soát nội dung — vi-rules-1.1.0

- Ma trận hiện có 17/168 ô chính tinh–cung với ít nhất một quy tắc; không coi đó là độ bao phủ đầy đủ tổ hợp.
- Chặn điều kiện tọa thủ danh sách rỗng, sao/cung không hợp lệ, độ sáng rỗng và Tứ Hóa không tồn tại trước khi đánh giá cá nhân.
- Thêm kiểm tra không áp dụng Thiên Lương Hóa Kỵ / Thất Sát Hóa Lộc; sửa các câu sai đã biết ở tư liệu giao diện cũ. Không tuyên bố toàn bộ tư liệu cũ đã được hiệu đính.
- Thêm 14 mục từ khóa Việt–Trung đúng nguyên văn constants.ts, chỉ là kiến thức chung, không tính thành 14 quy tắc cá nhân.
- Report.interpretationComplete luôn false ở phiên bản này; nhãn chưa đầy đủ hiện trong website/PDF/Markdown.
- Typecheck, kiểm thử nội dung, kiểm thử MVP và hồ sơ riêng đạt. Chromium kiểm lại tải PDF/mobile/không yêu cầu ra ngoài đạt. PDF mẫu mới 24 trang A4, kiểm độc lập không trang trắng bất thường, ký tự thay thế hoặc văn bản tràn trang.

## Rà soát 30 mục hiện có — vi-rules-1.2.0

Biên bản chi tiết tại SEMANTIC-REVIEW.md. Giữ 11 mục sau rà soát/giới hạn nghĩa (10 mục theo điều kiện, 1 chú giải); tạm khóa 19 mục vì mẩu nguồn không đủ hỗ trợ toàn bộ câu Việt hoặc còn thiếu điều kiện. Các mục không được duyệt sẽ không xuất thành kết luận dù điều kiện sao–cung khớp. Nếu thay văn bản, nguồn hoặc điều kiện, snapshot duyệt không còn khớp và mục phải được duyệt lại.

Đây là rà soát của trợ lý phát triển, chưa phải hiệu đính độc lập hoặc bảo đảm dự đoán đúng thực tế. Không coi các trích dẫn v4.0 là bản cổ đã được kiểm chứng độc lập. Typecheck, bộ kiểm MVP/hồ sơ riêng và bài kiểm duyệt ngữ nghĩa đạt; bản tĩnh build thành công. PDF mẫu mới 27 trang A4, kiểm độc lập không trang trắng bất thường/ký tự thay thế/văn bản tràn. Kiểm trình duyệt tải PDF, 12 cung/14 mục, mobile và không yêu cầu ra ngoài đạt.


## Gia cố sau rà soát bản ghi thực tế — report-1.2.0

- Chặn điều kiện không nhận diện, quan hệ viết sai, danh sách sao/độ sáng sai kiểu ngay tại hàm kiểm tra điều kiện. Không diễn giải quan hệ lạ thành mượn sao.
- Kiểm thử trên lưới lá số tổng hợp: sao mượn không thành sao tọa thủ, kể cả khi ghép với phụ tinh thực trong cung. Không lưu hồ sơ khách làm fixture công khai.
- Loại mọi nhận định còn conflictGroup khỏi phần tổng hợp cá nhân; chỉ ghi ở mục khác biệt. Độ ưu tiên và khử trùng lặp không được dùng để phân xử nội dung mâu thuẫn.
- Biên nhận v4.0 phải khớp khóa và toàn bộ trường sinh, manifest/checksum/phiên bản, trạng thái UNVERIFIED và chính tinh Mệnh thực tế. Kiểm tra tại đầu vào báo cáo và trước khi cache tệp đã tải. Đây là kiểm tra tính nhất quán, không xác nhận đúng nghĩa của văn bản nguồn.
- Bộ dò cũ chỉ ghi Hỏa/Linh tam hợp hoặc đối chiếu Tham Lang là quan hệ cấu trúc trung tính; không gắn thành cách đồng cung hay bảo đảm hoành tài. Trường hợp đồng cung vẫn ghi rõ chưa đối chiếu cổ thư độc lập.
- Cảnh báo lịch âm gốc và giới hạn đối chiếu lịch Việt Nam xuất hiện trước khi lập lá số và trong báo cáo.

Độ bao phủ nội dung không tăng bằng cách nới điều kiện: vẫn 30 mục, 11 mục được giữ sau rà soát (gồm chú giải), 19 mục tạm khóa; 7/168 ô có quy tắc theo điều kiện. Chưa đủ để cam kết luận giải hoàn chỉnh mọi lá số hoặc công bố bản thương mại đã nghiệm thu. Không triển khai công khai và không merge main trong đợt sửa này.

Kết quả đợt sửa: typecheck, test:vi (15 nhóm), test:content, toàn bộ npm test gốc (gồm 768 lá số kiểm toàn vẹn), build:vi và test trình duyệt với Chromium hệ thống đều đạt. PDF được kiểm độc lập 27 trang A4, không trang trắng bất thường, không ký tự thay thế/tràn chữ, font có tiếng Việt và chữ Hán. Hồ sơ riêng được kiểm từ tệp ngoài repository: biên nhận nguồn đúng lá số; bốn chính tinh mượn tại hai cung rỗng không thành tọa thủ; thêm nguồn không làm thay đổi kết luận. Không đưa tệp riêng vào commit.
