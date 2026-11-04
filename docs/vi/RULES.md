# Biên tập quy tắc và kiểm tra logic

MVP chỉ chứa một tập nhỏ quy tắc; không tương đương toàn bộ kho v4.0. `translationStatus: reviewed-static` nghĩa bản Việt đã được người phát triển biên tập trong giai đoạn xây dựng, **không** có nghĩa đã được chuyên gia độc lập hiệu đính. `verification: tested` nói về điều kiện hình thức được kiểm bằng mã, không xác nhận khả năng dự báo hay mọi trích dẫn là cổ thư chuẩn.

## Thêm nội dung đúng cách

1. Chọn một nhận định và ghi đoạn gốc, nguồn, mục cụ thể, giấy phép. Tách lời giảng phi thương mại khỏi nội dung dùng trong sản phẩm; không chép kho trả phí.
2. Viết điều kiện đầy đủ: `resident` đòi sao thực trong cung; `relation` chọn trine/opposite/meeting/borrowed tường minh. `brightness` luôn kèm trường phái. `hua` kiểm thuộc tính sao cùng cung.
3. Nếu không mô hình hóa được điều kiện, đánh dấu `verification: unverified` hoặc `kind: reference`. Không dùng tên sao xuất hiện trong văn bản làm bằng chứng.
4. Ghi các điều kiện loại trừ. Thiếu dữ kiện → CONDITIONAL; sai dữ kiện → CONTRADICTED; không nguồn/không điều kiện → UNVERIFIED; kiến thức chung → GENERAL_REFERENCE.
5. Biên tập bản Việt có điều kiện, không thêm nghề/sự kiện/bệnh/tuổi thọ từ suy đoán. Phân biệt lời nguồn và hướng thực hành do biên tập.
6. Gán `concept` cho các đoạn cùng ý; priority chỉ chọn bản diễn đạt đầy đủ hơn, không chọn vì tích cực hơn. Các tổ hợp chưa có quy tắc vẫn đứng riêng, không ghép thành ý nghĩa mới.
7. Viết kiểm thử dương/âm, trường hợp chỉ hội chiếu, trường hợp mượn sao, trường phái khác và điều kiện loại trừ. Tăng CONTENT_VERSION.

Chỉ APPLICABLE được đưa vào các mục cá nhân. GENERAL_REFERENCE không ghép vào kết luận. Tất cả các trạng thái còn lại hiện ở phụ lục để kiểm tra. Tổ hợp Tử Vi–Phá Quân tại Phúc Đức có hai lời khác nhau trong cùng cổ thư, được trình bày song song kèm ghi ‘chưa phân xử’.

## Bộ dữ liệu v4.0

Số bản ghi dịch đầy đủ được công bố: 0. Không đưa bản dịch cá nhân đã tạo trong cuộc trò chuyện này vào sản phẩm công khai. Nguyên văn năm nạp vào máy chỉ dùng đối chiếu, không tự thành quy tắc, không dịch lúc chạy. Quy tắc Việt tĩnh chỉ dùng các trích đoạn ngắn có ghi nguồn; không dùng trích lời Nghê Hải Hạ trong tập MVP để tránh nhập nhằng điều kiện phi thương mại.

## Mở rộng sau MVP

Cần thêm thẩm định chuyên môn, quy tắc cho nhiều tổ hợp, địa danh Việt Nam có nguồn, kiểm thử múi giờ vùng lịch sử và quy tắc vận hạn được kiểm chứng. Không nâng con số bao phủ bằng cách tạo template chung gắn với mọi sao/cung.

## Kiểm kê mức độ đầy đủ (bổ sung sau MVP)

`npm run test:content` kiểm tra cấu trúc điều kiện và những Tứ Hóa không tồn tại. `npm run audit:content` xuất `artifacts/coverage-audit.json`: ma trận **14 chính tinh × 12 cung = 168 ô**. Hiện mới **17/168 ô** có ít nhất một quy tắc điều kiện. Một ô có quy tắc không đồng nghĩa mọi tổ hợp, độ sáng và hội chiếu trong ô đó đã được luận đủ. Các tổ hợp nhiều sao, phụ/sát, vận hạn cần kiểm kê riêng trước khi tuyên bố hoàn tất.

`Report.interpretationComplete` hiện cố định `false`. PDF, Markdown và giao diện nêu rõ nội dung chưa đầy đủ, kể cả khi một hồ sơ có nhận định ở đủ các chủ đề. Không đổi cờ này bằng cách điền đủ tiêu đề hoặc thêm từ điển 14 sao. Từ điển Việt–Trung mới chỉ dịch các từ khóa thực trong constants.ts, được trình bày như kiến thức chung, không tính vào số nhận định cá nhân.

Tư liệu cũ StarDetailPanel có các câu sai bảng Tứ Hóa (Thiên Lương Hóa Kỵ, Thất Sát Hóa Lộc) và nhầm tổ hợp Nhật–Lương với Nhật–Nguyệt. Các câu đã biết này được sửa/đánh dấu chưa xác minh; không vì vậy coi toàn bộ tư liệu cũ đã được hiệu đính. Nguồn cổ/bản dịch vẫn cần kiểm tra từng trích dẫn và từng điều kiện.

## Rà soát ngữ nghĩa — vi-rules-1.2.0

Xem [SEMANTIC-REVIEW.md](./SEMANTIC-REVIEW.md): đã đọc và phân loại từng mục trong toàn bộ 30 quy tắc. 11 mục được giữ theo bản viết đã giới hạn nghĩa (10 mục áp dụng khi khớp lá số, 1 chú giải chung); 19 mục chờ nguồn hoặc điều kiện đầy đủ. Đây là biên tập của trợ lý, chưa phải hiệu đính độc lập hoặc xác nhận dự báo đúng thực tế.

`content/vi/review.ts` là biên bản; `review-snapshots.json` giữ chính xác bản nội dung, nguồn và điều kiện đã rà soát. ID không phải giấy phép tự động: thêm/sửa văn bản hay điều kiện mà không duyệt lại sẽ trả UNVERIFIED, kể cả khi vị trí sao khớp. Không tự tạo lại snapshot trong CI; chỉ cập nhật sau khi đọc lại nội dung và ghi lý do duyệt.

Ma trận 17/168 của phiên bản trước chỉ đếm cấu trúc điều kiện. Sau bước duyệt ngữ nghĩa, còn **7/168 ô** có ít nhất một quy tắc được giữ. Không được diễn giải sự giảm này là lỗi thuật toán hoặc lấp chỗ trống bằng nội dung chưa duyệt. PDF, giao diện và phụ lục đều phải công khai giới hạn.
