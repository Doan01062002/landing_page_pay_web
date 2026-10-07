import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { motionAllowed } from './Motion.jsx'
import { Lightbox } from '../landings/media.jsx'
import { templates } from '../data/templates.js'
import { projects } from '../data/projects.js'
import { site, formatVND } from '../data/site.js'
import '../styles/lp.css'
import '../styles/hero.css'

/*
  Hero trang chủ: nền tối, vòng thẻ 3D xoay chậm phía sau (ảnh chụp thật của từng mẫu),
  khung trình duyệt đè lên phía trước, chữ ngắn ở giữa.

  Bố cục máy tính / máy tính bảng: mọi thứ đặt theo toạ độ của một khung thiết kế 1172 × 657 px
  rồi phóng cả khung bằng MỘT transform: k = min(rộng / W, cao màn hình còn lại / 560).
  Điện thoại (≤ 700px): bố cục cột bình thường (xem hero.css).
*/

// Video demo: quay lại từ chính các mẫu (cuộn trang).
const DEMOS = [
  { type: 'video', src: '/videos/demo-autopro.mp4', poster: '/videos/demo-autopro.jpg', title: 'Mẫu AutoPro Garage trên máy tính', caption: 'Phần mềm gara ô tô: dịch vụ, bảng giá theo km, tra cứu, đặt lịch' },
  { type: 'video', src: '/videos/demo-motofix.mp4', poster: '/videos/demo-motofix.jpg', title: 'Mẫu MotoFix 247 trên điện thoại', vertical: true, caption: 'Hơn 80% khách tìm tiệm sửa xe bằng điện thoại' },
  { type: 'video', src: '/videos/demo-ceramic.mp4', poster: '/videos/demo-ceramic.jpg', title: 'Landing page tặng kèm: Ceramic Studio', caption: 'Một ưu đãi, video xưởng, đếm ngược, form giữ suất' },
]

// Ảnh chụp các mẫu (public/images/hero, chụp lại bằng script: xem README) → thẻ trên vòng xoay
const SHOTS = [
  ...projects.map((p) => ({ img: `/images/hero/du-an-${p.slug}.webp`, name: p.name })),
  ...templates.map((t) => ({ img: `/images/hero/${t.slug}.webp`, name: t.name })),
]
// Khung trình duyệt phía trước: lần lượt đổi mẫu
const DESKS = [
  { img: '/images/hero/autopro-desk.webp', host: 'autopro-garage.vn', alt: 'Mẫu phần mềm AutoPro Garage' },
  { img: '/images/hero/du-an-vinfast-desk.webp', host: 'xedien-vinfast.demo', alt: 'Landing page xe điện VinFast (bản mẫu)' },
  { img: '/images/hero/partshub-desk.webp', host: 'partshub.vn', alt: 'Mẫu cửa hàng phụ tùng PartsHub' },
  { img: '/images/hero/du-an-minhphat-desk.webp', host: 'minhphatauto.demo', alt: 'Landing page gara Minh Phát (bản mẫu)' },
]

// Hình học vòng xoay: camera đặt ở tâm trụ (perspective = bán kính) nên mỗi thẻ luôn nhìn thẳng vào camera;
// 37 thẻ cách nhau 360/37°, thẻ quá ±42° bị ẩn (nửa sau của trụ).
const R = 891
const N = 37
const STEP = 360 / N
const CULL = 42
const SPEED = 1.9 // độ / giây

// Khung thiết kế
const CW = 1172
const CH = 657
const VIS_H = 780 // phần khung được hiện (dài hơn 657 để khung trình duyệt lộ nhiều trang hơn)
const TAB_MIN = 701
const TAB_MAX = 1080
const DW_MIN = 920

// Bầu sao: một div 1px, cả trường sao là một danh sách box-shadow (rẻ, không cần ảnh)
function starShadow(n, blur, aMin, aMax, seed) {
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  return Array.from({ length: n }, () => `${(rnd() * 100).toFixed(2)}vw ${(rnd() * 100).toFixed(2)}vh ${blur}px 0 rgba(255,255,255,${(aMin + rnd() * (aMax - aMin)).toFixed(2)})`).join(',')
}

function Ring() {
  const ringRef = useRef(null)
  const cards = useMemo(() => Array.from({ length: N }, (_, i) => SHOTS[i % SHOTS.length]), [])

  useEffect(() => {
    const els = [...ringRef.current.children]
    const shades = els.map((el) => el.querySelector('.hx-card__shade'))
    let phase = -2
    let last = performance.now()
    let raf = 0
    let visible = true

    const place = () => {
      for (let i = 0; i < N; i++) {
        const a = ((((i * STEP + phase) % 360) + 540) % 360) - 180 // góc có dấu, -180..180
        const el = els[i]
        if (Math.abs(a) > CULL) {
          if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
          continue
        }
        el.style.visibility = 'visible'
        const r = (a * Math.PI) / 180
        const c = Math.cos(r)
        el.style.transform = `translate3d(${(R * Math.sin(r)).toFixed(2)}px,0,${(R * (1 - c)).toFixed(2)}px) rotateY(${(-a).toFixed(3)}deg)`
        // thẻ ở rìa tối dần: lớp phủ tối thay vì filter: brightness (rẻ hơn nhiều khi vẽ lại mỗi khung hình)
        shades[i].style.opacity = ((Math.abs(a) / CULL) * 0.55).toFixed(3)
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
    if (motionAllowed()) raf = requestAnimationFrame(tick)
    // chỉ quay khi hero còn trên màn hình
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = performance.now()
    })
    io.observe(ringRef.current)
    const onVis = () => (last = performance.now()) // quay lại tab: không nhảy
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div className="hx-ring" ref={ringRef} aria-hidden="true">
      {cards.map((c, i) => (
        <div className="hx-card" key={i}>
          <img src={c.img} alt="" width="260" height="600" decoding="async" onError={(e) => e.currentTarget.parentElement.classList.add('is-broken')} />
          <span className="hx-card__cap">{c.name}</span>
          <i className="hx-card__shade" />
          <i className="hx-card__edge" />
        </div>
      ))}
    </div>
  )
}

function Browser() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!motionAllowed()) return
    const id = setInterval(() => setI((x) => (x + 1) % DESKS.length), 4800)
    return () => clearInterval(id)
  }, [])
  return (
    <Link to="/mau-phan-mem" className="hx-browser" aria-label="Xem kho mẫu">
      <span className="hx-browser__bar">
        <span className="hx-browser__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="hx-browser__omni">
          <Icon name="ShieldCheck" size={11} />
          <span key={i}>{DESKS[i].host}</span>
        </span>
      </span>
      <span className="hx-browser__page">
        {DESKS.map((d, j) => (
          <img key={d.img} src={d.img} alt={j === i ? d.alt : ''} className={j === i ? 'is-on' : ''} width="1200" height="750" decoding="async" />
        ))}
      </span>
    </Link>
  )
}

// Hiệu ứng vào trang: chạy ngay, hoặc chờ màn mở đầu logo (IntroSplash) xong.
// Dùng các thuộc tính translate / scale / clip-path riêng, không đụng transform đã dùng để căn vị trí.
function useEntrance(rootRef) {
  // useLayoutEffect: gắn hiệu ứng trước lần vẽ đầu tiên, nội dung không loé lên trước khi chạy
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!motionAllowed() || !root.animate) return
    const EXPO = 'cubic-bezier(.16,1,.3,1)'
    const steps = [
      ['.hx-badge', { opacity: 0, translate: '0 11px', scale: '.985' }, 560, 120],
      ['.hx-h1--a', { opacity: 0, translate: '0 15px', clipPath: 'inset(100% 0 -30% 0)' }, 900, 230],
      ['.hx-h1--b', { opacity: 0, translate: '0 15px', clipPath: 'inset(100% 0 -30% 0)' }, 900, 320],
      ['.hx-sub', { opacity: 0, translate: '0 10px' }, 620, 540],
      ['.hx-cta > *', { opacity: 0, translate: '0 13px', scale: '.985' }, 620, 680],
      ['.hx-ring', { opacity: 0, translate: '0 18px', scale: '.99' }, 950, 550],
      ['.hx-browser', { opacity: 0, translate: '0 26px' }, 900, 760],
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
    run()
  }, [rootRef])
}

export default function HomeHero() {
  const [demo, setDemo] = useState(null)
  const rootRef = useRef(null)
  const stars = useMemo(() => ({ a: starShadow(150, 0, 0.05, 0.3, 7), b: starShadow(18, 1.2, 0.35, 0.7, 13) }), [])
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
      const vh = Math.max(560, window.innerHeight - top)
      const k = Math.min(vw / W, vh / 560)
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
      <div className="hx-bg" aria-hidden="true">
        <i className="hx-stars" style={{ boxShadow: stars.a }} />
        <i className="hx-stars" style={{ boxShadow: stars.b }} />
      </div>

      <div className="hx-canvas" style={{ '--fill': `${VIS_H - CH}px` }}>
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
          <Browser />
        </div>
      </div>

      {demo !== null && <Lightbox items={DEMOS} index={demo} onClose={() => setDemo(null)} onIndex={setDemo} />}
    </section>
  )
}
