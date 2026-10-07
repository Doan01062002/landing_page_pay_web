# ChungAuto – Kho mẫu phần mềm ngành ô tô

Frontend (React + Vite) cho trang bán mẫu phần mềm dành cho gara ô tô, tiệm sửa xe máy, chuỗi lốp – ắc quy, detailing, phụ tùng, đại lý ô tô và showroom xe cũ. Chưa có backend, toàn bộ dữ liệu là dữ liệu mẫu.

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
| `/mau-phan-mem` | Kho mẫu: mẫu dựng riêng (`projects.js`) xếp trước, rồi mẫu phần mềm. Tìm kiếm (không dấu), lọc theo hình thức, loại hình, tính năng, chi phí; sắp xếp. Hỗ trợ `?key=`, `?loai=`, `?ht=rieng\|phanmem` |
| `/mau-phan-mem/:slug` | Chi tiết mẫu: xem trước máy tính + điện thoại, đổi bộ màu, "Chọn mẫu này", "Xem thử" |
| `/demo/:slug` | Xem thử toàn màn hình: đổi thiết bị (máy tính / máy tính bảng / điện thoại), đổi màu, đổi mẫu |
| `/preview/:slug` | Website mẫu chạy độc lập (được nhúng trong iframe ở các trang trên) |
| `/mau-landing-page` | 3 mẫu landing page quảng cáo tặng kèm |
| `/demo-landing/:slug` | Xem thử landing page theo thiết bị |
| `/lp/:slug` | Landing page tặng kèm chạy độc lập |
| `/du-an` | Chuyển sang `/mau-phan-mem?ht=rieng` (trang dự án đã gộp vào Kho mẫu) |
| `/demo-du-an/:slug` | Xem thử mẫu dựng riêng theo thiết bị |
| `/du-an/:slug/` | Trang của mẫu dựng riêng (file tĩnh), gửi link này cho khách xem |

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

## Mẫu dựng riêng (trước đây "Dự án đã triển khai")

- Dữ liệu: `src/data/projects.js` (loại: `landing`, `website`, `shop` = trang bán hàng; `category` dùng chung ngành với Kho mẫu, vd `phutung` cho trang bán phụ kiện; tên, ảnh bìa, điểm nổi bật). Hiện đầu Kho mẫu với nhãn "Dựng riêng", thẻ ở `src/components/ProjectTile.jsx`.
- Trang tĩnh nằm trong `public/du-an/<slug>/` và chạy tại `/du-an/<slug>/`. Hiện có `nhatduc` (Gara Nhật Đức Long Biên), `nhatduc-motion` (bản Motion, xem bên dưới), `carcarservice` (Gara Ô Tô Đức Tùng – Cơ sở 2) và hai bản mẫu `minhphat`, `vinfast`.
- Cập nhật sau khi sửa landing ở thư mục làm việc (`D:/Chungauto/landing_page_<x>`): chạy `node scripts/sync-du-an.mjs` (hoặc `node scripts/sync-du-an.mjs nhatduc`). Script chép `assets` + `index.html` vào `public/du-an/<slug>/` và tự chèn `<base href="/du-an/<slug>/">` để ảnh, CSS đúng cả khi link thiếu dấu `/` cuối.
- Thêm dự án mới: khai báo thư mục trong `PROJECTS` của `scripts/sync-du-an.mjs`, chạy script, rồi thêm vào `projects.js`.
- Giao diện: Đức Tùng dùng `assets/css/theme-ductung.css` (xanh + vàng cam), Nhật Đức dùng `assets/css/theme-nhatduc.css` (đỏ + xám than), cả hai nạp sau `styles.css` chung khung. Ảnh xưởng đã chỉnh màu/độ nét; bản gốc lưu ở `D:/Chungauto/_anh-goc`.
- `vercel.json` và plugin `project-pages` trong `vite.config.js` trả `index.html` của dự án cho `/du-an/<slug>` (production và dev).

### Gara Nhật Đức – bản Ladi (`nhatduc-ladi`)

- Mã nguồn: `D:/Chungauto/landing_page_nhatduc_ladi` (HTML/CSS/JS tĩnh, git riêng). Bố cục theo mẫu landing LadiPage (w.tuybutky.com/khoa-hoc-marketing-0098), màu đỏ logo + vàng cam.
- Cấu hình form và thời gian hiện popup: `CONFIG` đầu `assets/js/main.js`. Đếm ngược chạy tới hết tháng (ưu đãi tháng).
- Cập nhật: `node scripts/sync-du-an.mjs nhatduc-ladi`.

### Gara Nhật Đức – bản Motion (`nhatduc-motion`)

- Mã nguồn: `D:/Chungauto/landing_page_nhatduc_motion` (Vite + React, git riêng). framer-motion (nút, tab, popup), GSAP ScrollTrigger (ghim, cuộn ngang, parallax), Lenis (cuộn mượt). Nội dung sửa ở `src/content.js`.
- Cập nhật: `npm run build` trong thư mục đó, rồi ở đây chạy `node scripts/sync-du-an.mjs nhatduc-motion` (chép nguyên `dist/`, dự án khai báo `dist: true`).
- Video: đang là video tạm dựng từ ảnh xưởng (`npm run videos`). Hướng dẫn tạo video AI bằng MotionSites và thay file: `VIDEO-PROMPTS.md` trong thư mục dự án.
- Luôn chạy đủ video và hiệu ứng, kể cả máy bật "giảm chuyển động" (nhiều máy Windows tắt sẵn hiệu ứng động). Thêm `?motion=0` vào link để xem bản tĩnh.
- Thiết kế và kế hoạch: `docs/superpowers/specs/2026-10-06-nhatduc-motion-design.md`, `docs/superpowers/plans/2026-10-06-nhatduc-motion.md`.

## Bản mẫu: Gara Ô Tô Minh Phát (`minhphat`)

- Landing page gara một trang với **thương hiệu hư cấu** (logo, địa chỉ, hotline, email đều là thông tin minh hoạ; nút Zalo/Fanpage cuộn tới form). Mã nguồn: `D:/Chungauto/landing_page_minhphat`. Cập nhật: `node scripts/sync-du-an.mjs minhphat` → `/du-an/minhphat/`.
- Thông tin liên hệ nằm ở khối `C` đầu `assets/js/main.js`, logo SVG ở hàm `logo()`. Khi giao cho gara thật: thay hai chỗ này, tạo lại 2 mã QR (`assets/img/qr-*.svg`) và bỏ `demo: true` trong `src/data/projects.js`.

## Bản mẫu: Landing page xe điện VinFast (`vinfast`)

- Trang demo học tập một file, **không phải web chính thức của VinFast**. Mã nguồn: `D:/Chungauto/landing_page_vinfast/index.html` (không có thư mục `assets`; ảnh xe, ảnh 360° lấy trực tiếp từ máy chủ VinFast). Cập nhật: `node scripts/sync-du-an.mjs vinfast` → `/du-an/vinfast/`.
- Dự án có `demo: true` trong `src/data/projects.js`: thẻ hiện nhãn tím "Bản mẫu" thay cho "Đã triển khai".

## Mẫu dựng riêng (trang tĩnh)

- Kho mẫu hỗ trợ mẫu có trường `url` (vd `/mau/<slug>/`): thẻ, trang chi tiết, trang xem thử dùng trang tĩnh đó thay cho bộ dựng TemplateSite. Khai báo dự án trong `scripts/sync-du-an.mjs` với `dir: 'mau'`.

## Mẫu bán xe (đại lý, showroom xe cũ)

- Dữ liệu: `src/data/autoTemplates.js` (Mitsubishi Xpander, showroom Xe Lướt, đại lý VinFast 3S nhiều dòng xe). Khối giao diện: `src/templates/autoSections.jsx`.
- Công cụ: tính giá lăn bánh theo tỉnh, tính trả góp (dư nợ giảm dần), định giá thu mua xe cũ, danh sách xe có bộ lọc, form nhiều tab.
- **Giá và thông số chỉ mang tính minh họa**, cần thay bằng số liệu chính thức của đại lý khi triển khai.
- Ảnh xe trong `public/images/xe` lấy từ Wikimedia Commons (CC0, CC BY, CC BY-SA). Tác giả ghi ở trường `credits` của từng mẫu và hiển thị ở chân trang; khi dùng ảnh CC BY / BY-SA phải giữ ghi nguồn.
- Đường dẫn cũ `/mau-website/...` tự chuyển sang `/mau-phan-mem/...`.

## Thêm một mẫu mới

Thêm một object vào `templates` trong `src/data/templates.js`. Chọn `hero.variant` (`split`, `overlay`, `search`, `shop`) và danh sách `sections` theo thứ tự hiển thị (`services`, `pricetable`, `lookup`, `booking`, `branches`, `products`, `beforeafter`, `packages`, `process`, `testimonials`, `news`).

## Khi nối backend

- Form tư vấn (`src/components/ConsultForm.jsx`) đang lưu tạm vào `localStorage` (`chungauto_leads`) trong hàm `saveLead`: thay bằng lời gọi API.
- Form đặt lịch, tra cứu biển số, giỏ hàng trong website mẫu chỉ là bản minh họa (`src/templates/sections.jsx`).
- Dữ liệu mẫu trong `src/data/` có thể chuyển thành API mà không phải sửa giao diện.

## Hero trang chủ

- `src/components/HomeHero.jsx` + `src/styles/hero.css`: nền tối, vòng 37 thẻ 3D xoay chậm phía sau, khung trình duyệt đè phía trước, chữ ngắn ở giữa. Máy tính / máy tính bảng dùng khung thiết kế 1172 × 657 px phóng bằng `--k`; điện thoại (≤ 700px) dùng bố cục cột.
- Ảnh thẻ: `public/images/hero/<slug>.webp` (mẫu phần mềm, chụp `/preview/<slug>?embed=1`) và `du-an-<slug>.webp` (mẫu dựng riêng, chụp `/du-an/<slug>/`), khung điện thoại 390 × 900 thu về 260 × 600. Khung trình duyệt: `*-desk.webp`, chụp 1280 × 800 thu về rộng 1200. Thêm mẫu mới thì chụp thêm ảnh cùng tên, nếu thiếu ảnh thẻ hiện nền gradient.
- `src/components/IntroSplash.jsx`: màn mở đầu logo (một lần mỗi phiên, `?intro=1` để xem lại); xong thì phát sự kiện `chungauto:intro-done` để hero chạy hiệu ứng hiện chữ.

## Hiệu ứng chuyển động

- `src/components/Motion.jsx`: `RevealManager` (hiện dần khi cuộn), `CountUp` (số chạy), `ScrollProgress`, `useScrolled`.
- Gắn vào JSX: `data-reveal="up|left|right|zoom|fade"` cho một phần tử, hoặc `data-stagger="up"` trên phần tử cha để các con hiện lần lượt.
- CSS nằm trong `src/styles/motion.css`. Khi hệ điều hành bật "giảm chuyển động", trang tự chuyển sang dạng mờ dần nhẹ, bỏ các chuyển động lớn và lặp liên tục.
- Ảnh thu nhỏ của mẫu (`/preview/:slug?embed=1`) luôn tắt hiệu ứng.
