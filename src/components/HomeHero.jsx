import { useEffect, useMemo, useRef, useState } from 'react'
import { useIsoLayoutEffect } from '../lib/iso.js'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { motionAllowed } from './Motion.jsx'
import { Lightbox } from '../landings/media.jsx'
import { formatVND } from '../data/site.js'
import { useCatalog, useSite } from '../lib/siteData.jsx'
import '../styles/lp.css'
import '../styles/hero.css'

/*
  Hero trang chủ: nền sáng, chữ ngắn ở giữa, vòng thẻ 3D (ảnh chụp thật của từng mẫu) xoay chậm bên dưới.

  Máy tính / máy tính bảng: mọi thứ đặt theo toạ độ của một khung thiết kế 1172 px, cả khung phóng bằng MỘT
  transform: k = min(rộng / W, cao màn hình còn lại / VIS_H) để hero luôn vừa màn hình đầu.
  Điện thoại (≤ 700px): bố cục cột bình thường (xem hero.css).
*/

// Video demo: quay lại từ chính các mẫu (cuộn trang).
const DEMOS = [
  { type: 'video', src: '/videos/demo-autopro.mp4', poster: '/videos/demo-autopro.jpg', title: 'Mẫu AutoPro Garage trên máy tính', caption: 'Phần mềm gara ô tô: dịch vụ, bảng giá theo km, tra cứu, đặt lịch' },
  { type: 'video', src: '/videos/demo-motofix.mp4', poster: '/videos/demo-motofix.jpg', title: 'Mẫu MotoFix 247 trên điện thoại', vertical: true, caption: 'Hơn 80% khách tìm tiệm sửa xe bằng điện thoại' },
  { type: 'video', src: '/videos/demo-ceramic.mp4', poster: '/videos/demo-ceramic.jpg', title: 'Landing page tặng kèm: Ceramic Studio', caption: 'Một ưu đãi, video xưởng, đếm ngược, form giữ suất' },
]

// Ảnh chụp các mẫu (public/images/hero, 390 × 900; chụp lại bằng script: xem README) → thẻ trên vòng xoay
const shotsOf = ({ templates, projects }) => [
  ...projects.map((p) => ({ img: `/images/hero/du-an-${p.slug}.webp`, name: p.name })),
  ...templates.map((t) => ({ img: `/images/hero/${t.slug}.webp`, name: t.name })),
]

// Hình học vòng xoay: camera đặt ở tâm trụ (perspective = bán kính R) nên mỗi thẻ luôn nhìn thẳng vào camera;
// 37 thẻ cách nhau 360/37°, thẻ quá ±42° bị ẩn (nửa sau của trụ).
const R = 891
const N = 37
const STEP = 360 / N
const CULL = 42
const SPEED = 1.9 // độ / giây
const PHASE0 = -2
// góc có dấu (-180..180) của thẻ i khi vòng quay ở pha phase
const angleOf = (i, phase) => ((((i * STEP + phase) % 360) + 540) % 360) - 180
// tải ảnh trước khi thẻ lộ ra 2 nấc; thẻ ở xa chỉ tải khi sắp quay tới (giảm tải trang ban đầu)
const NEAR = CULL + 2 * STEP

// Khung thiết kế
const CW = 1172
const VIS_H = 730 // chiều cao được hiện: đáy thẻ giữa (560 + 150) + chỗ cho bóng đổ
const TAB_MIN = 701
const TAB_MAX = 1080
const DW_MIN = 920

/*
  Mỗi thẻ có vị trí CỐ ĐỊNH trên trụ (đặt một lần); mỗi khung hình chỉ xoay MỘT phần tử cha (.hx-spin).
  Trước đây ghi transform cho từng thẻ mỗi khung hình. Thẻ chỉ đổi visibility khi đi qua mép ±42° (rất hiếm).
*/
function Ring() {
  const spinRef = useRef(null)
  const catalog = useCatalog()
  const cards = useMemo(() => {
    const shots = shotsOf(catalog)
    return Array.from({ length: N }, (_, i) => shots[i % shots.length])
  }, [catalog])

  useEffect(() => {
    const spin = spinRef.current
    const els = [...spin.children]
    const shown = new Array(N).fill(null)
    let phase = PHASE0
    let last = performance.now()
    let raf = 0
    let visible = true
    // chỉ dựng thẻ nằm trong khung nhìn thật (điện thoại hẹp: ~5 thẻ thay vì 9) – đỡ việc vẽ 3D trên máy yếu
    const show = spin.parentElement.parentElement
    const cull = Math.min(CULL, (Math.asin(Math.min(1, (show.clientWidth / 2 + 65) / R)) * 180) / Math.PI + 3)
    const near = cull + 2 * STEP

    const place = () => {
      spin.style.transform = `translateZ(${R}px) rotateY(${(-phase).toFixed(3)}deg) translateZ(${-R}px)`
      for (let i = 0; i < N; i++) {
        const a = angleOf(i, phase)
        const img = els[i].firstElementChild
        if (!img.getAttribute('src') && Math.abs(a) <= near) img.src = img.dataset.src
        const on = Math.abs(a) <= cull
        if (on !== shown[i]) {
          shown[i] = on
          els[i].style.visibility = on ? 'visible' : 'hidden'
        }
      }
    }
    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((t - last) / 1000, 0.1)
      last = t
      if (!visible || document.hidden) return
      phase -= SPEED * dt
      place()
    }
    place()
    // bắt đầu quay khi trang đã tải xong và rảnh: không tranh tài nguyên với lần hiển thị đầu
    let idle = 0
    const start = () => motionAllowed() && (last = performance.now(), (raf = requestAnimationFrame(tick)))
    const begin = () => (idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 800))
    if (document.readyState === 'complete') begin()
    else window.addEventListener('load', begin, { once: true })
    // chỉ quay khi hero còn trên màn hình
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = performance.now()
    })
    io.observe(spin.parentElement)
    const onVis = () => (last = performance.now()) // quay lại tab: không nhảy
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', begin)
      if (window.cancelIdleCallback) cancelIdleCallback(idle)
      clearTimeout(idle)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div className="hx-ring" aria-hidden="true">
      <div className="hx-spin" ref={spinRef}>
        {cards.map((c, i) => (
          <div className="hx-card" key={i} style={{ transform: `translateZ(${R}px) rotateY(${(-i * STEP).toFixed(3)}deg) translateZ(${-R}px)` }}>
            <img src={Math.abs(angleOf(i, PHASE0)) <= NEAR ? c.img : undefined} data-src={c.img} alt="" width="390" height="900" decoding="async" onError={(e) => e.currentTarget.parentElement.classList.add('is-broken')} />
            <span className="hx-card__cap">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Hiệu ứng vào trang: chạy ngay, hoặc chờ màn mở đầu logo (IntroSplash) xong.
// Dùng các thuộc tính translate / scale / clip-path riêng, không đụng transform đã dùng để căn vị trí.
function useEntrance(rootRef) {
  // Chỉ chạy sau màn mở đầu logo. Lần vào sau (không có màn mở đầu) nội dung đã dựng sẵn từ máy chủ hiện ngay,
  // không ẩn rồi hiện lại (tránh nháy, tốt cho tốc độ hiển thị).
  useIsoLayoutEffect(() => {
    const root = rootRef.current
    if (!motionAllowed() || !root.animate) return
    const EXPO = 'cubic-bezier(.16,1,.3,1)'
    const steps = [
      ['.hx-badge', { opacity: 0, translate: '0 11px', scale: '.985' }, 560, 120],
      ['.hx-h1--a', { opacity: 0, translate: '0 15px', clipPath: 'inset(100% 0 -30% 0)' }, 900, 230],
      ['.hx-h1--b', { opacity: 0, translate: '0 15px', clipPath: 'inset(100% 0 -30% 0)' }, 900, 320],
      ['.hx-sub', { opacity: 0, translate: '0 10px' }, 620, 540],
      ['.hx-cta > *', { opacity: 0, translate: '0 13px', scale: '.985' }, 620, 680],
      ['.hx-ring', { opacity: 0, translate: '0 40px' }, 1100, 600],
    ]
    const run = () => {
      steps.forEach(([sel, from, dur, delay]) =>
        root.querySelectorAll(sel).forEach((el, n) => {
          const to = { opacity: 1 }
          if (from.translate) to.translate = '0 0'
          if (from.scale) to.scale = '1'
          if (from.clipPath) to.clipPath = 'inset(-30% 0 -30% 0)'
          el.animate([from, to], { duration: dur, delay: delay + n * 70, easing: EXPO, fill: 'backwards' })
        }),
      )
    }
    // đang chạy màn mở đầu logo: chữ được giấu bằng CSS (intro.css), chờ sự kiện xong rồi mới hiện
    if (document.documentElement.classList.contains('intro-hold')) {
      window.addEventListener('chungauto:intro-done', run, { once: true })
      return () => window.removeEventListener('chungauto:intro-done', run)
    }
  }, [rootRef])
}

export default function HomeHero() {
  const site = useSite()
  const { templates, projects } = useCatalog()
  const [demo, setDemo] = useState(null)
  const rootRef = useRef(null)
  const total = templates.length + projects.length

  // Phóng khung thiết kế theo bề rộng và chiều cao màn hình còn lại dưới thanh menu
  useEffect(() => {
    const root = rootRef.current
    const fit = () => {
      const vw = root.clientWidth
      if (vw <= 700) {
        root.style.removeProperty('--k')
        root.style.removeProperty('height')
        return
      }
      // máy tính bảng: thu hẹp cửa sổ thiết kế để chữ không nhỏ theo màn hình (liên tục tại 1080px)
      let W = vw >= TAB_MAX ? CW : DW_MIN + ((vw - TAB_MIN) * (CW - DW_MIN)) / (TAB_MAX - TAB_MIN)
      // máy tính bảng dựng đứng: cửa sổ hẹp hơn nữa để chữ đọc rõ (hai bên vòng thẻ được phép tràn khỏi khung)
      if (vw < TAB_MAX && window.innerHeight > vw * 1.15) W = Math.min(W, 840)
      const top = root.getBoundingClientRect().top + window.scrollY
      const vh = Math.max(600, window.innerHeight - top)
      const k = Math.min(vw / W, vh / VIS_H)
      root.style.setProperty('--k', k.toFixed(4))
      root.style.height = `${Math.round(VIS_H * k)}px`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEntrance(rootRef)

  return (
    <section className="hx" ref={rootRef}>
      <div className="hx-bg" aria-hidden="true" />

      <div className="hx-canvas">
        <Link to="/mau-landing-page" className="hx-badge">
          <i>
            <Icon name="Gift" size={15} />
          </i>
          <b>Tặng landing page {formatVND(site.promo.giftValue)}</b>
        </Link>

        <h1 className="hx-h1">
          <span className="hx-h1--a">Website &amp; phần mềm</span>
          <span className="hx-h1--b">ngành ô tô</span>
        </h1>

        <p className="hx-sub">
          <b>{total} mẫu dựng sẵn</b> cho gara, đại lý, detailing và phụ tùng.{' '}
          <br />
          Bàn giao trong 7 ngày, chạy mượt trên điện thoại.
        </p>

        <div className="hx-cta">
          <Link to="/mau-phan-mem" className="hx-btn">
            <span>Xem kho mẫu</span>
          </Link>
          <button type="button" className="hx-play" onClick={() => setDemo(0)}>
            <Icon name="Play" size={14} /> Video demo
          </button>
        </div>

        <div className="hx-show">
          <Ring />
        </div>
      </div>

      {demo !== null && <Lightbox items={DEMOS} index={demo} onClose={() => setDemo(null)} onIndex={setDemo} />}
    </section>
  )
}
