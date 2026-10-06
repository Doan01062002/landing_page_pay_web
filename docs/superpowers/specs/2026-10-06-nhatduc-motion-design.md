# Landing Gara Nhật Đức – bản Motion (thiết kế)

Ngày: 06/10/2026 · Trạng thái: chờ duyệt spec

## 1. Mục tiêu

Làm một landing page mới hoàn toàn, hiện đại, nhiều chuyển động cho Gara Nhật Đức Long Biên, dựa trên nội dung thật của landing đang chạy tại `/du-an/nhatduc/`. Bản cũ giữ nguyên để so sánh.

Công cụ bắt buộc (theo yêu cầu): framer-motion, Lenis, GSAP (ScrollTrigger), video dựng từ ảnh bằng MotionSites AI.

### Tiêu chí hoàn thành

- Build ra file tĩnh, chạy tại `/du-an/nhatduc-motion/` (dev, preview và Vercel).
- Chạy mượt trên điện thoại 375px, không có thanh cuộn ngang.
- Khi hệ điều hành bật "giảm chuyển động": tắt Lenis, ghim, cuộn ngang; chỉ còn hiện mờ dần.
- Thay video AI = chép đè file cùng tên trong `public/videos/` rồi build lại, không sửa code.
- `npm run build` không lỗi, console không có lỗi khi chạy.

### Không làm

- Không bịa số liệu, đánh giá, chứng nhận mới. Chỉ dùng nội dung đã có ở bản cũ.
- Không làm backend cho form (giữ cơ chế `formEndpoint` như bản cũ).
- Không tự đăng nhập hay tải ảnh lên MotionSites (cần tài khoản của chủ dự án).

## 2. Nội dung (lấy nguyên từ bản cũ)

- Tên: Gara Nhật Đức Long Biên · Công ty TNHH TM & DV Ô tô Nhật Đức · MST 0601321230.
- Địa chỉ: Số 8 & 9 No10B, KĐT Sài Đồng, Phúc Lợi, Long Biên, Hà Nội · toạ độ 21.0399848, 105.9122211.
- Giờ: 08:00 – 17:30, Thứ 2 – Thứ 7. Hotline / Zalo: 08 3695 3695. Email: minhhoi0305@gmail.com.
- Mạng xã hội: Facebook garanhatduclongbien, TikTok @garaotonhatduc, YouTube @minhhoiauto-garanhatduc.
- Số liệu: 16 chỗ, 5★ Google, 5 chuyên ngành, 100% báo giá trước khi sửa.
- Dịch vụ: Đồng sơn – gò hàn – phục hồi xe tai nạn; Sửa chữa máy – gầm – điện – điều hoà; Bảo dưỡng nhanh & định kỳ; khác: Bảo hiểm ô tô, Mua bán – ký gửi xe, Cứu hộ – kéo xe.
- Video: YouTube `cbJ1UoQdtfU` (đánh bóng), TikTok `7657133340587281685` (điều hoà Nissan Kicks, 26K+ lượt xem).
- 4 cam kết: KTV tận tâm, Thiết bị hiện đại, Minh bạch 100%, Bảo hành dài hạn.
- Bảng giá 3 tab (Bảo dưỡng / Sơn gò / Chăm sóc), 9 gói, giá như bản cũ. Voucher: tặng Rửa xe + Khử mùi điều hoà cho hoá đơn từ 3.000.000đ.
- Đặt lịch: giảm 10% công thợ, miễn phí kiểm tra 30 hạng mục, gọi lại trong 5 phút.
- Đánh giá Google: Phon Nguyen (5★) + thẻ mời viết đánh giá.
- Ảnh: 15 ảnh webp trong `landing_page_nhatduc/assets/img`.

## 3. Giao diện

Tông **sáng, theo màu logo** (người dùng chọn thay cho tông tối):

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `--bg` | `#ffffff` | nền chính |
| `--bg-soft` | `#f5f6f8` | nền mục xen kẽ |
| `--red` | `#d71e28` | màu thương hiệu, nút chính, chữ nhấn |
| `--red-600` | `#b8161f` | hover |
| `--red-50` | `#fdf0f0` | nền nhấn nhạt |
| `--ink` | `#1f2933` | chữ chính, khối tương phản (footer, voucher) |
| `--ink-2` | `#55606b` | chữ phụ |
| `--line` | `#e6e8eb` | đường kẻ |

- Font: Montserrat 800–900 in hoa cho tiêu đề (giống chữ logo), Be Vietnam Pro cho nội dung.
- Bo góc lớn cho khung ảnh/video (20–28px), nút bo 999px. Chữ tiêu đề rất lớn (clamp tới ~7rem trên desktop).
- Logo: dùng lại SVG lục giác N–D đã vẽ ở bản cũ.

## 4. Kiến trúc

- Thư mục mã nguồn: `D:/Chungauto/landing_page_nhatduc_motion/` (Vite + React 18), khởi tạo git riêng để không mất lịch sử.
- Phụ thuộc: `react`, `react-dom`, `framer-motion`, `gsap`, `@gsap/react`, `lenis`.
- `vite.config.js`: `base: '/du-an/nhatduc-motion/'`, build ra `dist/`.
- `src/content.js`: toàn bộ nội dung (mục 2), các component chỉ đọc từ đây.
- `src/lib/motion.js`: khởi tạo Lenis, nối với `gsap.ticker` và `ScrollTrigger.update`; hàm `prefersReducedMotion()`; dùng `gsap.matchMedia()` để tắt hiệu ứng nặng.
- `src/sections/*.jsx`: mỗi mục một file. `src/ui/*.jsx`: Logo, Icon, MagneticButton, VideoModal, Lightbox, SplitText (tách chữ cho hiệu ứng).
- `src/styles.css`: token + kiểu chung.

Phân vai thư viện:
- **Lenis**: cuộn mượt toàn trang; neo `#dat-lich`… cuộn qua `lenis.scrollTo`.
- **GSAP ScrollTrigger** (qua `useGSAP` để tự dọn): ghim, scrub, cuộn ngang, parallax, thẻ chồng.
- **framer-motion**: nút hút theo chuột, gạch chân tab (`layoutId`), `AnimatePresence` cho bảng giá/popup/menu, chữ hiện khi vào khung (`whileInView`).

## 5. Các mục

1. **Màn chờ (~1s)**: logo lục giác vẽ nét (stroke-dashoffset), mở ra hero. Bỏ qua khi giảm chuyển động.
2. **Header**: trong suốt → nền trắng mờ khi cuộn; logo, menu (Dịch vụ, Xưởng, Bảng giá, Liên hệ), nút hotline hút chuột, nút Cứu hộ. Điện thoại: menu toàn màn hình (framer-motion).
3. **Hero**: video xưởng toàn khung, lớp phủ trắng → trong suốt bên trái để chữ đọc rõ; tiêu đề in hoa hiện từng chữ; 2 CTA. Cuộn xuống: video thu lại thành khung bo góc (scrub).
4. **Băng hãng xe + số liệu**: marquee nghiêng theo tốc độ cuộn; số đếm khi vào khung.
5. **Dịch vụ**: ghim mục, cuộn dọc → 3 thẻ video trượt ngang + thẻ "Dịch vụ khác". Điện thoại: xếp dọc, không ghim. Bấm thẻ → popup phát TikTok/YouTube (thẻ chưa có video mở kênh).
6. **Xưởng thực tế**: lưới ảnh nhiều cột chạy lệch tốc độ (parallax), chữ lớn chạy ngang theo cuộn; bấm ảnh → lightbox.
7. **Video nổi bật + đánh giá**: khung video Nissan Kicks, điểm Google 5,0 và thẻ đánh giá.
8. **4 cam kết**: thẻ chồng lên nhau khi cuộn (sticky + scale).
9. **Bảng giá + voucher**: 3 tab, gạch chân trượt, gói đổi bằng AnimatePresence; vé voucher nền xám than.
10. **Đặt lịch**: form (họ tên, SĐT, dịch vụ đã chọn, honeypot) trên nền ảnh xưởng phủ trắng; kiểm tra SĐT Việt Nam; gửi `formEndpoint` nếu có, không thì lưu `localStorage` (`cc_bookings`); popup thành công. Nút "Đặt lịch" ở thẻ dịch vụ/gói giá điền sẵn dịch vụ.
11. **Footer**: chữ "NHẬT ĐỨC" khổng lồ hiện dần, thông tin liên hệ, bản đồ Google, mạng xã hội.
12. **Nổi**: Zalo + Gọi (desktop), thanh thao tác 5 nút (điện thoại), nút lên đầu, thanh tiến độ cuộn.

## 6. Video MotionSites

- `VIDEO-PROMPTS.md` trong thư mục dự án: mỗi cảnh ghi ảnh nguồn, prompt tiếng Anh, tỉ lệ, độ dài, tên file đích.
- Cảnh: `hero` (16:9, mặt tiền/xưởng), `svc-son` (phòng sơn), `svc-maygam` (xe trên cầu nâng), `svc-baoduong` (Innova trên cầu nâng), `xuong` (toàn cảnh xưởng).
- Video tạm: `scripts/make-videos.mjs` gọi ffmpeg tạo zoom/pan chậm từ ảnh thật, H.264, không tiếng, ≤ 8s, mục tiêu ≤ 1,5 MB/file, kèm poster `.jpg`.
- Video: `muted playsinline loop`, chỉ tải khi gần vào khung (`preload="none"` + IntersectionObserver), có poster.

## 7. Tích hợp vào Chungauto2

- `scripts/sync-du-an.mjs`: thêm dạng dự án đã build (`{ folder, dist: true }`) → chép `dist/` vào `public/du-an/nhatduc-motion/`, không chèn `<base>` (Vite đã đặt base).
- `src/data/projects.js`: thêm thẻ "Gara Nhật Đức – bản Motion".
- `vercel.json` / plugin `project-pages` đã xử lý `/du-an/:slug` chung, không cần sửa.

## 8. Lỗi và trường hợp biên

- Video không tải được → giữ poster. JS lỗi ở một mục không làm hỏng mục khác (mỗi mục tự dọn qua `useGSAP`).
- Đổi kích thước cửa sổ → `ScrollTrigger.refresh()`; ảnh tải xong → refresh.
- Popup/lightbox: khoá cuộn (`lenis.stop()`), Esc để đóng, trả focus về nút đã bấm.

## 9. Kiểm tra

- `npm run build` sạch.
- Xem trên trình duyệt: desktop 1440, điện thoại 375; console không lỗi; không cuộn ngang (`scrollWidth <= innerWidth`).
- Thử: tab giá, popup video, lightbox, form (sai SĐT báo lỗi, đúng → popup), neo menu, chế độ giảm chuyển động.
- Chụp màn hình làm bằng chứng.
