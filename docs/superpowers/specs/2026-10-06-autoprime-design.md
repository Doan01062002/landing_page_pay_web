# Mẫu website bán xe + phụ tùng "AUTOPRIME" (thiết kế + kế hoạch)

Ngày: 06/10/2026 · Đã duyệt trong hội thoại.

## Yêu cầu

- **Menu + hero**: y hệt kết quả trong video TikTok @ai.so.easy/7632313929166769429 (MotionSites "Swift and Simple Transport" + video xe chạy do Higgsfield/Kling tạo):
  video nền toàn màn hình (xe chạy, đèn), lớp phủ tối; dòng nhỏ trên tiêu đề; tiêu đề in hoa rất đậm 3 dòng (dòng 2 màu nhấn); đoạn mô tả; nút "Get started";
  menu: logo trái · liên kết · nút "Contact us" màu nhấn; thẻ kính góc trái dưới "Book a Free Consultation" + nút.
- **Phần dưới**: y hệt bố cục theme Sapo **EGA Autocare** (ega-autocare.mysapo.net), nội dung đổi sang **bán cả xe lẫn phụ tùng**.
- Thương hiệu giả định **AUTOPRIME** (mẫu bán cho nhiều đại lý), tên/hotline/địa chỉ tập trung trong `src/content.js`.
- Video hero tạm: Mixkit #52427 (đã được phép tải), chỉnh màu tối ấm; kèm prompt Higgsfield/Kling để thay.

## Token (đo từ EGA)

Vàng cam `#F5A623`, đen `#12161C`, đỏ giảm giá `#EB3030`, xám giá cũ `#9E9089`, nền kem nhạt `#FBFAF7`.
Tiêu đề Oswald 700–900 in hoa (2 màu: đen + vàng), chữ thân Be Vietnam Pro. Thẻ bo 12–16px. Hero dùng Rubik 900 (như video).

## Các khối (thứ tự)

1. Header trong suốt trên hero → nền đen khi cuộn; logo · Xe mới · Phụ tùng · Ưu đãi · Tin tức · Liên hệ · giỏ hàng · nút "LIÊN HỆ".
2. Hero video (như trên) + thẻ kính "Đặt lịch lái thử miễn phí".
3. Flash sale phụ tùng: hộp tối (đếm ngược tới hết ngày, % giảm, quà tặng, nút) + băng thẻ sản phẩm trượt (nhãn -%, hãng, tên, giá đỏ, giá cũ gạch, nút giỏ, thanh "Vừa mở bán").
4. Mã ưu đãi: thẻ tối có khuyết vé, mã + COPY / HẾT HẠN, chấm chuyển trang.
5. Xe đang bán: thẻ ảnh xe (nhãn loại xe), tên, giá từ, nút "Nhận báo giá".
6. Quy trình mua xe 5 bước: nền đen, ảnh xe, icon lục giác nối nét đứt, 5 thẻ.
7. Trước & sau lắp phụ kiện: 2 thanh kéo so sánh (ảnh minh hoạ).
8. Bảng giá 4 gói phụ kiện lăn bánh (gói 3 nổi bật "PHỔ BIẾN NHẤT").
9. Phụ tùng theo tab (3 tab) + lưới thẻ.
10. Xe bán chạy: băng thẻ.
11. Banner ưu đãi tối vàng + 6 icon lục giác.
12. Video: 5 thẻ dọc (bấm phát popup) + link TikTok.
13. Giới thiệu showroom: ảnh + chữ + gạch đầu dòng + nút.
14. Cẩm nang: 4 thẻ bài viết.
15. Footer: 4 cam kết, cột thông tin/chính sách/hỗ trợ, đăng ký nhận tin, thanh toán.
Thêm: giỏ hàng mini (lưu trình duyệt), popup báo giá / lái thử (form), toast "đã sao chép mã", 2 nút tròn nổi bên phải (Zalo, Gọi).

## Kỹ thuật

- `D:/Chungauto/web_autoprime` (Vite + React, framer-motion, lenis), git riêng; build `base: /mau/autoprime/` → chép vào `Chungauto2/public/mau/autoprime/`.
- Chungauto2: `vercel.json` + plugin dev phục vụ `/mau/:slug`; Kho mẫu hỗ trợ mẫu có `url` (trang tĩnh).
- Ảnh: xe Wikimedia sẵn có (giữ ghi nguồn), phụ tùng từ ảnh CC0 + khung hình video Mixkit sẵn có. Giá, mã, bài viết là minh hoạ (ghi chú ở chân trang).

## Kiểm tra

Build sạch; Playwright 1440 & 390: không lỗi JS, không cuộn ngang; thử băng trượt, tab, kéo trước/sau, copy mã, giỏ hàng, form báo giá, popup video.
