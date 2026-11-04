# Giấy phép được kiểm tra cho MVP

Đối chiếu trường license và tệp giấy phép thực trong các package đã khóa của package-lock.json:

| Thành phần | Phiên bản đã kiểm | Giấy phép |
|---|---|---|
| Mã repository | upstream a600484 + nhánh MVP | MIT |
| iztro | 2.6.1 | MIT |
| lunar-javascript | 1.7.7 | MIT |
| moment / moment-timezone | 2.31.0 / 0.6.0, IANA 2025b | MIT |
| React / React DOM | 19.3.0 theo lockfile | MIT |
| jsPDF / jsPDF-AutoTable | 4.2.1 / 5.0.9 | MIT |
| @hpcc-js/wasm-zstd | 1.17.0 | Apache-2.0 |
| Zstandard được biên dịch trong WASM | version() trả 1.5.7 | BSD, giữ văn bản tại content/licenses/zstd-BSD.txt |
| Noto Sans SC tập con đổi tên Ziwei Report | SHA nguồn tại public/fonts/README.md | SIL OFL 1.1, kèm OFL.txt |
| Dữ liệu v4.0 | v4.0-13d, ca268829f7a9 | CC BY 4.0; ngoại lệ lời giảng theo DATASET-LICENSE |

Script build thu các tệp LICENSE/NOTICE thực của những package xuất hiện trong đồ thị bundle, kể cả dependency PDF nạp trễ, vào **THIRD-PARTY-NOTICES.txt**. Gói tĩnh còn kèm MIT của repository, DATASET-LICENSE, OFL của font và BSD của Zstandard. Script báo lỗi nếu package được bundle không có tệp giấy phép để tránh lược bỏ âm thầm. Không dùng dịch vụ có phí hoặc nội dung từ kho trả phí.

Các trích lời giảng Nghê Hải Hạ không thuộc phạm vi CC BY của toàn bộ dữ liệu và có điều kiện phi thương mại riêng theo README gốc. Tập quy tắc Việt MVP không dùng các trích lời giảng ấy; tư liệu năm chỉ được nạp cục bộ từ bản phát hành công khai để người dùng đối chiếu, luôn có nhãn chưa kiểm chứng. Không tự cấp quyền thương mại rộng hơn giấy phép nguồn.
