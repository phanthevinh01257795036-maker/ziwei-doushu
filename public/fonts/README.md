# Font báo cáo

Ziwei Report là tập con tĩnh 400 của Noto Sans SC, giấy phép SIL Open Font License 1.1 (OFL.txt). Đã đổi tên họ font khi tạo tập con. Hỗ trợ tiếng Việt và chữ Hán dùng trong dữ kiện/nguồn MVP. Không bảo đảm mọi chữ Hán trong toàn kho v4.0; báo cáo mặc định không xuất nguyên văn tự do.

Nguồn: https://github.com/google/fonts/tree/main/ofl/notosanssc

Tệp nguồn: NotoSansSC[wght].ttf; SHA-256: a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da

Quy trình: fontTools instantiateVariableFont wght=400; subset ký tự từ lib/ và content/, Latin mở rộng, Vietnamese U+1E00–1EFF. Khi thêm nội dung, kiểm tra cmap; bổ sung tập con nếu thiếu. Font phục vụ từ cùng website, không gọi Google Fonts khi chạy.
