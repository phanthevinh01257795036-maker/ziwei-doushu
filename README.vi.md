# Tử Vi Đẩu Số — website tiếng Việt, không tích hợp AI

Luồng MVP mới dùng bộ an sao hiện có và tập quy tắc Việt tĩnh. Chạy hoàn toàn trong trình duyệt, tạo PDF thật có thể tải, không cần tài khoản hoặc khóa API. Chưa triển khai website công khai và không tự merge vào main.

**Giới hạn quan trọng:** hiện có 30 quy tắc Việt trong danh mục; sau [rà soát ngữ nghĩa](docs/vi/SEMANTIC-REVIEW.md), 11 mục được giữ (gồm 1 chú giải chung), 19 mục tạm khóa vì thiếu nguồn/điều kiện đầy đủ. Đây chưa phải hiệu đính độc lập. Có hai cách cục xác nhận về cấu trúc, 14 mục báo cáo. Độ bao phủ tùy lá số; có hồ sơ không khớp quy tắc nào. Số bản ghi v4.0 có bản dịch Việt đầy đủ được công bố là **0**. Không đưa nguyên văn v4.0 vào kết luận cá nhân. Xem [khảo sát](docs/vi/AUDIT.md), [kiến trúc](docs/vi/ARCHITECTURE.md), [quy tắc](docs/vi/RULES.md).

## Dành cho người không biết lập trình

### Xem kết quả và tải bản đóng gói bằng GitHub

1. Mở Pull Request được bàn giao, chọn **Checks**.
2. Chờ **Build Vietnamese MVP (no deployment)** hiện dấu tích xanh; bấm **Details**.
3. Ở cuối trang chạy workflow, mục **Artifacts**, tải **website-tieng-viet** hoặc **bao-cao-va-kiem-thu-minh-hoa**. Cần đăng nhập GitHub để tải.
4. Gói thứ nhất là website tĩnh để đưa lên hosting sau khi bạn chấp thuận. Gói thứ hai có PDF mẫu từ **dữ liệu tổng hợp**, ảnh giao diện và các tệp dữ kiện mẫu; không có hồ sơ thật của chủ repository.

**Gói ZIP không tự trở thành website.** Không mở index.html bằng cách nhấp đúp rồi mong Worker hoạt động: các trình duyệt yêu cầu HTTP/HTTPS. Vì chưa được phép triển khai, nhánh này chỉ build và kiểm thử, không công bố URL. Sau khi bạn cho phép, có thể dùng GitHub Pages (thường miễn phí với repo công khai, theo quota/điều khoản GitHub) hoặc static hosting khác. Không cần backend và không có phí AI. Không có bước yêu cầu thẻ thanh toán trong sản phẩm.

### Chạy thử bằng các nút bấm trong Codespaces (tùy chọn)

Trên nhánh tính năng, chọn **Code → Codespaces → Create codespace on …**. GitHub có thể hiển thị quota/tính phí Codespaces; chỉ tiếp tục nếu tài khoản còn hạn mức miễn phí. Trong Codespaces, mở mục **NPM Scripts** của VS Code, chạy script **dev**, chờ thông báo và chọn **Open in Browser** cho cổng 3000. Không cần nhập lệnh Terminal. Các cổng Codespaces nên giữ **Private**.

Không có Codespace/hosting nào được tạo tự động bởi thay đổi này. Nếu môi trường không tự cài dependency, cần người hỗ trợ cài một lần; đây không phải thao tác phải làm cho mỗi lá số.

### Sử dụng khi website đã được chạy

1. Nhập ngày/tháng/năm, chọn dương/âm lịch. Với tháng âm nhuận, đánh dấu rõ; ngày/tháng không tồn tại sẽ báo lỗi.
2. Nhập giờ/phút dân dụng và giới tính dùng an sao.
3. Nhập địa điểm đủ cấp hành chính, có thể dùng tên cũ. Danh sách tỉnh chỉ là gợi ý, không xác minh tọa độ và không tự chọn nơi trùng tên.
4. Chọn múi giờ lịch sử hoặc nhập độ lệch thủ công. Việt Nam mặc định Asia/Ho_Chi_Minh và giờ chuẩn +420 phút; sinh trước 1976 cần kiểm tra vùng lịch sử. Đổi quốc gia phải kiểm tra lại giờ chuẩn.
5. Nếu muốn hiệu chỉnh mặt trời thực, nhập kinh độ có nguồn. Không có kinh độ thì không được hiệu chỉnh. Không dùng kinh độ tỉnh khác thay thế.
6. Trong tùy chọn, chọn QS/XD2, quy tắc Tý muộn, quy tắc tháng nhuận và năm âm lịch muốn xem. Bỏ trống năm thì không tự tạo vận hiện tại theo đồng hồ.
7. Bấm **Kiểm tra thông tin sinh**, đọc và đánh dấu từng xác nhận. Nếu giờ/ngày thay đổi, có cảnh báo riêng.
8. Bấm **Lập lá số và tạo báo cáo**. Các mục không đủ quy tắc ghi rõ chưa có luận; không chèn nội dung giả.
9. Chọn **Tải báo cáo PDF**, hoặc JSON dữ kiện / Markdown. PDF gồm bìa, mục lục có số trang, sơ đồ, đủ bảng sao, nguồn và các quy tắc bị loại. Tệp nằm trên máy bạn.

### Đối chiếu dữ liệu v4.0

Tùy chọn, không bắt buộc để lập lá số/xuất báo cáo theo quy tắc MVP. Chỉ hỗ trợ các năm 1950–2026.

- Chọn đối chiếu ở bước xác nhận để thử tải riêng năm sinh từ Release. Yêu cầu mạng không chứa ngày giờ, giới tính hoặc địa chỉ; GitHub vẫn nhận thông tin kết nối và năm trong URL.
- Nếu trình duyệt chặn CORS, ở cuối báo cáo bấm **Tải riêng year-YYYY.jsonl.zst từ Release**, sau đó chọn tệp vừa tải. Không phải tải toàn bộ 77 năm.
- Website kiểm kích thước và SHA-256 trước khi giải nén trong Worker; chỉ chấp nhận đúng một khóa, đúng y/m/d/h/g, đủ 13 mục. Không dùng ngày gần nhất.
- Khóa lấy từ **ngày lập lá số sau chuẩn hóa**, giờ địa chi và giới tính. Các tùy chọn trường phái không nằm trong khóa. Vì dữ liệu gốc dùng XD2, không coi nguồn này hoàn toàn đồng nhất với QS.
- Năm giải nén có thể hàng trăm MB đến khoảng 1 GB. Worker đọc luồng để không giữ nguyên năm trong RAM, nhưng cửa sổ Zstandard dài và bộ nhớ WASM vẫn có thể làm máy yếu thiếu bộ nhớ. Lỗi được hiển thị; báo cáo quy tắc vẫn dùng được.
- Cache chỉ lưu tệp nén năm công khai; **Xóa cache dữ liệu v4.0** để giải phóng. Không lưu hồ sơ hay báo cáo vào cache. Đóng/tải lại trang làm mất hồ sơ trong bộ nhớ.
- Xác thực tệp không đồng nghĩa lời luận đúng. Tư liệu Trung văn luôn có nhãn **UNVERIFIED**, không được tự đưa vào kết luận cá nhân và không được dịch bằng dịch vụ lúc chạy.

## Dành cho người bảo trì

```bash
npm ci
npm run typecheck
npm test
npm run test:vi
npm run build:vi
npx playwright install chromium
npm run test:browser
```

`dist/` là bản MVP tĩnh. `npm run dev` chạy Next.js, tự chuẩn bị Worker. `/` là công cụ Việt mới; `/legacy`, `/chart`, `/library`, `/knowledge`, `/heming` giữ các trang/khả năng lập lá số gốc. Các luồng chat/streaming suy luận không tồn tại đã được thay bằng hiển thị dữ kiện hoặc thông báo chưa có quy tắc. Không có SDK suy luận, API key hay telemetry.

Để kiểm tệp năm thật mà không tải tự động:

```bash
V4_TEST_FILE=/duong-dan/year-2005.jsonl.zst V4_TEST_YEAR=2005 npm run test:v4
```

Không commit tệp năm, tệp giải nén, PDF, JSON hồ sơ hoặc DOCX cá nhân. `.gitignore` đã loại các định dạng lớn/báo cáo; vẫn cần kiểm tra danh sách staged trước commit. Kiểm thử hồ sơ riêng nhận fixture qua `PRIVATE_BIRTH_FIXTURE` ở ngoài checkout và không in dữ liệu sinh ra log.

## Quyền sử dụng

Mã nguồn giữ MIT. Font tập con đổi tên Ziwei Report theo SIL OFL, có giấy phép tại public/fonts/OFL.txt. Dữ liệu v4.0 CC BY 4.0: giữ nguồn **紫微斗数开源解读数据集 v4.0**, tác giả **王多鱼AI**, https://github.com/Renhuai123/ziwei-doushu. Các lời giảng được trích có điều kiện riêng phi thương mại, không thuộc toàn bộ quyền dữ liệu; tập quy tắc Việt MVP không sử dụng các trích lời giảng ấy. Cổ thư thuộc phạm vi công cộng nhưng việc ghi đúng xuất xứ vẫn cần thẩm định; không tự coi toàn bộ các tệp tuyển chọn là bản cổ chuẩn.

Bản Việt có biên tập tĩnh và kiểm thử điều kiện, chưa được chuyên gia độc lập hiệu đính toàn bộ. Không dùng lá số để chẩn đoán, dự báo tử vong hoặc quyết định tài chính/pháp lý.
