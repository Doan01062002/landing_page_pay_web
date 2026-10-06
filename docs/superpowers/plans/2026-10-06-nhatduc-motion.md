# Landing Gara Nhật Đức – bản Motion · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Landing page mới, tông sáng theo logo, nhiều chuyển động (framer-motion + GSAP ScrollTrigger + Lenis, video dựng từ ảnh) cho Gara Nhật Đức, chạy tại `/du-an/nhatduc-motion/`.

**Architecture:** Dự án Vite + React riêng ở `D:/Chungauto/landing_page_nhatduc_motion/`, nội dung tập trung ở `src/content.js`, mỗi mục một component. Build ra `dist/`, script `sync-du-an.mjs` của Chungauto2 chép vào `public/du-an/nhatduc-motion/`.

**Tech Stack:** React 18, Vite 5, framer-motion 11, gsap 3 + @gsap/react, lenis 1, vitest (logic thuần), ffmpeg (video tạm).

**Spec:** `docs/superpowers/specs/2026-10-06-nhatduc-motion-design.md`

## Global Constraints

- `base: '/du-an/nhatduc-motion/'`; mọi đường dẫn ảnh/video qua `import.meta.env.BASE_URL`.
- Màu: `--red #d71e28`, `--red-600 #b8161f`, `--red-50 #fdf0f0`, `--ink #1f2933`, `--ink-2 #55606b`, `--line #e6e8eb`, `--bg #fff`, `--bg-soft #f5f6f8`.
- Font: Montserrat 800–900 (tiêu đề, in hoa), Be Vietnam Pro (nội dung).
- Chỉ dùng nội dung thật ở mục 2 của spec; không thêm số liệu/đánh giá.
- `prefers-reduced-motion: reduce` → không Lenis, không pin/scrub/cuộn ngang, chỉ fade.
- ≤ 900px: không ghim mục dịch vụ, thẻ xếp dọc.
- Không có cuộn ngang ở 375px.
- Video: `muted playsInline loop`, `preload="none"`, có `poster`, chỉ `play()` khi vào khung.

## Review Focus

- SĐT có dấu cách/chấm/+84 (`0836 953 695`, `+84 836953695`) → hợp lệ; `12345` → báo lỗi. Test ở Task 2.
- Link TikTok `/video/<id>` và YouTube `watch?v=`, `youtu.be/`, `shorts/` → nhúng đúng; link rỗng → mở kênh. Test ở Task 2.
- `localStorage` bị chặn (chế độ riêng tư) → gửi form vẫn hiện popup thành công, không văng lỗi. Test ở Task 2.
- Bấm neo menu khi đang ở trong mục bị ghim → cuộn đúng tới mục, không kẹt. Kiểm tra tay ở Task 8.
- Mở popup/lightbox rồi Esc → đóng, cuộn trang hoạt động lại (Lenis start). Kiểm tra tay ở Task 8.

---

### Task 1: Khởi tạo dự án, token, Lenis + GSAP

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`, `src/lib/motion.js`, `src/ui/Logo.jsx`, `src/ui/Icon.jsx`, `src/content.js`
- Copy: `../landing_page_nhatduc/assets/img/*.webp` → `public/img/`

**Interfaces:**
- Produces: `content` (default export của `src/content.js`, cấu trúc: `brand, contact, socials, stats, brands, services, extraServices, gallery, featuredVideo, reviews, commitments, pricing, voucher, booking`); `asset(path) => BASE_URL + path`; `useLenis()` trả instance Lenis hoặc `null`; `scrollToId(id)`; `reducedMotion(): boolean`; `<Logo className />`; `<Icon name className />` (tên: phone, wrench, shield, users, gauge, eye, award, clock, pin, brush, drop, file, sparkle, calendar, check, menu, x, arrow, star, play, siren, car, chat, receipt, gift, fb, yt, tiktok, snow).

- [ ] `npm create`-tương đương thủ công; cài `react react-dom framer-motion gsap @gsap/react lenis`, dev `vite @vitejs/plugin-react vitest`. `git init`.
- [ ] `src/lib/motion.js`: `gsap.registerPlugin(ScrollTrigger)`; `initLenis()` tạo Lenis (`lerp: 0.1`), `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`; không tạo khi reduced motion.
- [ ] `App.jsx` dựng khung các mục rỗng; `npm run dev` mở được trang, console sạch.
- [ ] Commit.

### Task 2: Logic thuần + test (form, video URL)

**Files:**
- Create: `src/lib/booking.js`, `src/lib/video.js`, `src/lib/booking.test.js`, `src/lib/video.test.js`

**Interfaces:**
- Produces: `normalizePhone(s): string|null` (trả `0xxxxxxxxx` 10 số đầu 03/05/07/08/09 hoặc `null`); `validateBooking({name, phone}) => {ok, errors:{name?, phone?}}`; `submitBooking(data, {endpoint, storage}) => Promise<void>` (POST JSON nếu có endpoint; không thì push vào `storage['cc_bookings']`; lỗi storage bị nuốt); `parseVideo(url) => {kind:'youtube'|'tiktok', id, embed} | null`.

- [ ] Viết test: `normalizePhone('0836 953 695') === '0836953695'`, `normalizePhone('+84 836953695') === '0836953695'`, `normalizePhone('12345') === null`; `validateBooking({name:'A', phone:'0836953695'}).errors.name` có; `submitBooking` với storage ném lỗi → resolve; `parseVideo('https://www.youtube.com/watch?v=cbJ1UoQdtfU').embed` chứa `youtube-nocookie.com/embed/cbJ1UoQdtfU`; `parseVideo('https://www.tiktok.com/@garaotonhatduc/video/7657133340587281685').embed` chứa `tiktok.com/embed/v2/7657133340587281685`; `youtu.be/`, `shorts/` cũng ra id; `parseVideo('') === null`.
- [ ] `npx vitest run` → FAIL. Viết code. → PASS. Commit.

### Task 3: Video tạm + prompt MotionSites

**Files:**
- Create: `scripts/make-videos.mjs`, `VIDEO-PROMPTS.md`, output `public/videos/{hero,svc-son,svc-maygam,svc-baoduong,xuong}.{mp4,jpg}`

- [ ] Script: mỗi cảnh `{name, src, w, h, motion}`; ffmpeg `zoompan` 8s 25fps, `libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart -an`; poster = khung đầu. Hero 1920×1080 (nguồn `storefront-2026` + crossfade sang `hero-2-workshop-cars`), dịch vụ 1080×1350 (4:5), xưởng 1920×1080.
- [ ] Chạy `node scripts/make-videos.mjs`; `ls -la public/videos` mỗi mp4 ≤ 1,5 MB (hero ≤ 2,5 MB).
- [ ] `VIDEO-PROMPTS.md`: bảng cảnh → ảnh nguồn, prompt tiếng Anh (chuyển động camera, ánh sáng, không thêm chữ/logo, giữ nguyên xe & biển hiệu), tỉ lệ, độ dài, tên file đích; quy trình thay file + lệnh nén ffmpeg.
- [ ] Commit.

### Task 4: Header, màn chờ, hero, marquee, số liệu

**Files:**
- Create: `src/sections/Preloader.jsx`, `Header.jsx`, `Hero.jsx`, `Marquee.jsx`, `Stats.jsx`, `src/ui/MagneticButton.jsx`, `src/ui/SplitWords.jsx`, `src/ui/LazyVideo.jsx`

**Interfaces:**
- Produces: `<MagneticButton as href className>`; `<SplitWords text className />` (mỗi từ `span.w > span`); `<LazyVideo src poster className />` (play khi vào khung, pause khi ra).

- [ ] Preloader: SVG logo vẽ nét 0.9s rồi trượt lên (framer-motion), gọi `onDone`; hero chỉ chạy timeline sau `onDone`.
- [ ] Header: `useScroll` → class `is-scrolled`; menu mobile `AnimatePresence`; neo dùng `scrollToId`.
- [ ] Hero: GSAP timeline chữ từ dưới lên (stagger 0.06); ScrollTrigger scrub: khung video `clip-path inset(0 0 0 0 round 0)` → `inset(6% 4% 6% 4% round 28px)`, chữ dịch lên + mờ.
- [ ] Marquee: 2 hàng lặp, `xPercent` loop; skew theo `lenis.velocity` (clamp ±8deg). Stats: đếm số bằng gsap khi `onEnter`.
- [ ] Xem trình duyệt 1440 & 375, console sạch. Commit.

### Task 5: Dịch vụ (cuộn ngang) + popup video

**Files:**
- Create: `src/sections/Services.jsx`, `src/ui/VideoModal.jsx`, `src/ui/useModal.js`

**Interfaces:**
- Consumes: `parseVideo`, `LazyVideo`, `useLenis`.
- Produces: `openVideo({url, href, title})` qua context `VideoModalProvider`; `useModalLock(open)` (Lenis stop/start, Esc, trả focus); `selectService(name)` qua context `BookingContext` (Task 7 cung cấp; Task 5 tạo context rỗng trong `src/ui/booking-context.js`).

- [ ] `gsap.matchMedia`: `(min-width: 901px) and (prefers-reduced-motion: no-preference)` → pin section, track `x: -(scrollWidth - innerWidth)`, `scrub: 1`, `invalidateOnRefresh`. Còn lại: thẻ dọc, fade.
- [ ] Thẻ: video tạm làm nền, số thứ tự 01–03, tiêu đề, mô tả, nút "Xem video" (mở popup / mở kênh) và link đặt lịch điền sẵn dịch vụ. Thẻ cuối "Dịch vụ khác".
- [ ] Kiểm tra: popup YouTube/TikTok phát, Esc đóng, trang cuộn lại được. Commit.

### Task 6: Xưởng (parallax + lightbox), video nổi bật, đánh giá, cam kết

**Files:**
- Create: `src/sections/Workshop.jsx`, `src/sections/Featured.jsx`, `src/sections/Commitments.jsx`, `src/ui/Lightbox.jsx`

- [ ] Workshop: tiêu đề chạy ngang theo cuộn (`x` scrub); lưới 3 cột, cột giữa `yPercent` ngược chiều (desktop); bấm ảnh → Lightbox (trước/sau, phím ←/→, Esc, `useModalLock`).
- [ ] Featured: khung video `xuong.mp4` + nút phát TikTok Nissan Kicks; khối Google 5,0 + thẻ đánh giá + thẻ mời viết đánh giá.
- [ ] Commitments: 4 thẻ `position: sticky` top lệch dần; thẻ phía sau `scale` 0.92 khi thẻ sau đè (scrub).
- [ ] Xem 1440 & 375. Commit.

### Task 7: Bảng giá, voucher, đặt lịch, footer, nút nổi

**Files:**
- Create: `src/sections/Pricing.jsx`, `src/sections/Booking.jsx`, `src/sections/Footer.jsx`, `src/sections/FloatingBar.jsx`; Modify: `src/ui/booking-context.js`

**Interfaces:**
- Consumes: `validateBooking`, `submitBooking`, `content.booking.endpoint` (mặc định `''`).

- [ ] Pricing: tab ARIA (`role=tablist`, phím ←/→), gạch chân `layoutId="tab-ink"`, `AnimatePresence mode="wait"` cho lưới gói; nút "Đặt lịch" → `selectService(plan.service)` + cuộn `#dat-lich`.
- [ ] Booking: lỗi hiển thị dưới ô; nút loading; thành công → modal (`useModalLock`), reset form, `window.dataLayer?.push({event:'booking_submit'})`.
- [ ] Footer: chữ "NHẬT ĐỨC" khổng lồ (chữ hiện theo cuộn), liên hệ, bản đồ iframe lazy, mạng xã hội. FloatingBar: Zalo/Gọi (≥ 901px), thanh 5 nút (≤ 900px), nút lên đầu, thanh tiến độ cuộn.
- [ ] Thử form: SĐT sai → lỗi; đúng → modal. Commit.

### Task 8: Tích hợp Chungauto2 + kiểm tra cuối

**Files:**
- Modify: `D:/Chungauto/Chungauto2/scripts/sync-du-an.mjs`, `src/data/projects.js`, `README.md`
- Create: `D:/Chungauto/Chungauto2/public/du-an/nhatduc-motion/**` (từ build)

- [ ] `sync-du-an.mjs`: `PROJECTS` cho phép `{ folder, dist: true }`; với `dist` → `rmSync(dest)` rồi `cpSync(src/dist, dest)`, bỏ bước chèn `<base>`. Thêm `'nhatduc-motion': { folder: 'landing_page_nhatduc_motion', dist: true }`.
- [ ] `npm run build` (dự án motion) sạch → `node scripts/sync-du-an.mjs nhatduc-motion`.
- [ ] `projects.js`: thêm mục `nhatduc-motion` (cover `storefront-2026.webp`, accent `#d71e28`, highlights: Video dựng từ ảnh, Cuộn mượt Lenis, Hiệu ứng GSAP, Bảng giá động, Đặt lịch 30 giây, Nút gọi, Zalo nổi). README: mục ngắn cách sửa/build/sync + thay video.
- [ ] Chạy dev Chungauto2, mở `/du-an/nhatduc-motion` (thiếu `/` cuối) và `/du-an`: ảnh/video tải đúng, console sạch, `document.documentElement.scrollWidth <= innerWidth` ở 375px; thử các mục Review Focus; chế độ giảm chuyển động (emulate). Chụp màn hình.
- [ ] Commit ở cả hai repo.
