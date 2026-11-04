# Khảo sát repository — MVP tiếng Việt

Cơ sở khảo sát: commit upstream `a600484a49255039d0725f1ba9e11ca81a948f97`, cũng là main của repository chủ sở hữu khi bắt đầu. Không tạo repository hoặc fork mới. Không đưa hồ sơ người thật vào cây mã nguồn.

## A. Có thể tái sử dụng

| Thành phần | Bằng chứng mã nguồn | Phạm vi |
|---|---|---|
| Next.js 16, React, TypeScript, Tailwind | package.json, app/, components/ | Giữ các trang cũ; trang chính thêm luồng Việt |
| Lập lá số | lib/ziwei/algorithm.ts, generateChart | iztro + các bản vá của dự án; 12 cung, chính/phụ tinh, Tứ Hóa, Cục, Mệnh/Thân, đại hạn |
| Âm–dương lịch, nhuận | lunar-solar.ts, lunarMonthDayCount/lunarToSolar | Không đoán độ dài tháng, không nhận ngày không tồn tại |
| Giờ mặt trời thực | true-solar-time.ts | Kinh độ, NOAA, utcOffsetMinutes, giờ địa chi và đổi ngày |
| Giờ chuẩn | clock-adjust.ts | Phép đổi độ lệch; không tự áp DST |
| Bảng QS/XD1/XD2/ZZ | school-data.ts, school-tables.generated.ts | MVP cho chọn QS/XD2, không trộn bảng |
| Tứ Hóa năm | sihua.ts, getLiuNianSiHua | Đưa vào lớp riêng; không suy dự báo sự kiện |
| Đại hạn | algorithm.ts, yunxian-context.ts | Tuổi mụ theo năm âm lịch; loại phụ thuộc đồng hồ khỏi ChartFacts |
| Tư liệu, danh mục sách | lib/classics/, lib/seo/ | Cần thẩm định nội dung trước khi dùng làm luận cá nhân |
| Kiểm thử | scripts/regression/ | Giữ bộ cũ; thay bài kiểm streaming dịch vụ đã gỡ bằng kiểm tra không gọi mạng |

## B. Cần mở rộng — đã có phần MVP

- Biểu mẫu gốc chỉ thiên về giờ Bắc Kinh, địa danh Trung Quốc; share.ts dùng chênh kinh độ không gồm NOAA. Luồng Việt mới gọi trực tiếp hàm gốc true-solar-time.ts, không sửa hành vi biểu mẫu cũ.
- Thêm múi giờ lịch sử có dữ liệu khóa phiên bản, xác nhận độ lệch thực tế/chuẩn, giờ trùng hoặc không tồn tại, cảnh báo khi đổi giờ/ngày.
- Thêm ChartFacts bất biến, quan hệ cung tường minh, bộ quy tắc điều kiện và mẫu Việt có nguồn.
- Có html2canvas/share-card cũ nhưng chưa có báo cáo PDF tiếng Việt: thêm PDF trực tiếp, không chụp ảnh văn bản.
- Có giao diện cũ: giữ /legacy, /chart, /library, /knowledge và khởi hai lá số ở /heming; gỡ đường gọi dịch vụ suy luận không tồn tại.

## C. Chưa có ở bản gốc

- db-analysis.ts chỉ là placeholder, STAR_DB rỗng, không phải kho luận giải đầy đủ.
- Không có /api/interpret hoặc /api/heming; có nút và fetch phía client nhưng không có backend. MVP gỡ lời gọi, SDK và lời mời cấu hình API key.
- Không có kho v4.0 trong Git: dữ liệu công khai ở Release; thêm manifest 77 năm có SHA-256, parser dòng và giải nén Zstandard luồng nền.
- Không có Rule Validation Engine, nội dung Việt theo điều kiện, PDF A4 hoặc bản build tĩnh độc lập cho luồng Việt.

## D. Chưa thể xác minh hoặc chưa hoàn tất

- Chưa có gazetteer Việt Nam đầy đủ cấp xã/huyện và lịch sử sáp nhập. Nhận địa danh cũ bằng văn bản và gợi ý tên tỉnh; KHÔNG xác nhận địa chỉ/kinh độ từ tên tỉnh. Không tự chọn nơi trùng tên.
- Chưa dịch/kiểm chứng toàn bộ v4.0. Số bản ghi được tuyên bố có bản dịch đầy đủ: **0**. Chỉ một tập quy tắc Việt tĩnh được biên tập và kiểm thử điều kiện.
- patterns.ts có nhiều cách cục nhưng import server-only; không đưa nguyên bộ vào client hoặc tự coi mọi mô tả của nó đã thẩm định. MVP xác nhận hai cấu trúc giới hạn tại Mệnh.
- lib/classics/data/quanshu.ts tự ghi là bản tuyển chọn, có các câu giải thích hiện đại. Không tự coi mọi dòng là nguyên văn cổ thư đã đối chiếu.
- CORS khi tải GitHub Release tùy trình duyệt/hạ tầng. Có nhập tệp nén đã tải, cùng phép kiểm SHA; không dựng proxy gửi thông tin sinh.
- Bộ nhớ giải nén cửa sổ dài có thể vượt khả năng điện thoại yếu. Worker có timeout, giới hạn kích thước, lỗi rõ ràng. Không hứa mọi thiết bị đọc nổi năm dữ liệu.
- Điều kiện được kiểm bằng mã không chứng minh tử vi dự báo đúng. Không dự báo bệnh, tử vong, số con, sự kiện năm/tháng chưa có quy tắc.
