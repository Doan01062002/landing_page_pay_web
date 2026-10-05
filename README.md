# ChungAuto – Kho mẫu website cho ngành sửa chữa xe

Frontend (React + Vite) cho trang bán mẫu website dành cho gara ô tô, tiệm sửa xe máy, chuỗi lốp – ắc quy, detailing, phụ tùng. Chưa có backend, toàn bộ dữ liệu là dữ liệu mẫu.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở http://localhost:5180

## Các trang

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Landing page chào hàng: tính năng, mẫu nổi bật, quà tặng landing page, quy trình 7 ngày, bảng giá, đánh giá, hỏi đáp, form tư vấn |
| `/mau-website` | Kho mẫu: tìm kiếm (không dấu), lọc theo loại hình, tính năng, chi phí; sắp xếp. Hỗ trợ `?key=`, `?loai=` |
| `/mau-website/:slug` | Chi tiết mẫu: xem trước máy tính + điện thoại, đổi bộ màu, "Chọn mẫu này", "Xem thử" |
| `/demo/:slug` | Xem thử toàn màn hình: đổi thiết bị (máy tính / máy tính bảng / điện thoại), đổi màu, đổi mẫu |
| `/preview/:slug` | Website mẫu chạy độc lập (được nhúng trong iframe ở các trang trên) |
| `/mau-landing-page` | 3 mẫu landing page quảng cáo tặng kèm |
| `/demo-landing/:slug` | Xem thử landing page theo thiết bị |
| `/lp/:slug` | Landing page tặng kèm chạy độc lập |

## Cấu trúc

```
src/
  data/site.js         Tên thương hiệu, hotline, nội dung khuyến mãi
  data/landing.js      Quy trình, gói giá, đánh giá, FAQ
  data/templates.js    8 mẫu website: bộ màu, font, kiểu hero, section, nội dung
  templates/           Bộ dựng website mẫu (TemplateSite + các section)
  pages/               Landing, Gallery, TemplateDetail, Demo, Preview
  components/          Header, Footer, form tư vấn, LivePreview (iframe thu nhỏ)…
  styles/              base, landing, gallery, demo, template
public/images/         Ảnh minh họa CC0 từ StockSnap
```

## Landing page tặng kèm

- Dữ liệu: `src/data/landings.js` (ưu đãi, hạn chót, số suất, video, ảnh xưởng, các bước, đánh giá).
- Bộ dựng: `src/landings/LandingSite.jsx`, video và trình xem lớn: `src/landings/media.jsx`, giao diện: `src/styles/lp.css`.
- Kiểu hero: `split` (chữ + video dọc), `center` (chữ giữa + video ngang), `overlay` (video toàn khung + thẻ nổi).
- Video trong `public/videos` lấy từ Mixkit (giấy phép miễn phí), đã nén tối đa 12 giây, bỏ tiếng. Thay bằng video của gara: nén bằng
  `ffmpeg -i in.mp4 -t 12 -an -vf scale=-2:720 -c:v libx264 -crf 27 -movflags +faststart mk-<id>.mp4` và tạo ảnh đại diện `mk-<id>.jpg`.
- Ảnh xưởng trong `public/images/xuong` được trích từ chính các video.

## Thêm một mẫu mới

Thêm một object vào `templates` trong `src/data/templates.js`. Chọn `hero.variant` (`split`, `overlay`, `search`, `shop`) và danh sách `sections` theo thứ tự hiển thị (`services`, `pricetable`, `lookup`, `booking`, `branches`, `products`, `beforeafter`, `packages`, `process`, `testimonials`, `news`).

## Khi nối backend

- Form tư vấn (`src/components/ConsultForm.jsx`) đang lưu tạm vào `localStorage` (`chungauto_leads`) trong hàm `saveLead`: thay bằng lời gọi API.
- Form đặt lịch, tra cứu biển số, giỏ hàng trong website mẫu chỉ là bản minh họa (`src/templates/sections.jsx`).
- Dữ liệu mẫu trong `src/data/` có thể chuyển thành API mà không phải sửa giao diện.

## Hiệu ứng chuyển động

- `src/components/Motion.jsx`: `RevealManager` (hiện dần khi cuộn), `CountUp` (số chạy), `ScrollProgress`, `useScrolled`.
- Gắn vào JSX: `data-reveal="up|left|right|zoom|fade"` cho một phần tử, hoặc `data-stagger="up"` trên phần tử cha để các con hiện lần lượt.
- CSS nằm trong `src/styles/motion.css`. Khi hệ điều hành bật "giảm chuyển động", trang tự chuyển sang dạng mờ dần nhẹ, bỏ các chuyển động lớn và lặp liên tục.
- Ảnh thu nhỏ của mẫu (`/preview/:slug?embed=1`) luôn tắt hiệu ứng.
