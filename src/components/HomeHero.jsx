import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import LivePreview from './LivePreview.jsx'
import { useCycle, prefersReducedMotion } from './Motion.jsx'
import { AutoVideo, Lightbox } from '../landings/media.jsx'
import { templates } from '../data/templates.js'
import { site, formatVND } from '../data/site.js'
import '../styles/lp.css'
import '../styles/hero.css'

const WORDS = ['gara ô tô', 'tiệm sửa xe máy', 'xưởng detailing', 'cửa hàng lốp', 'chuỗi phụ tùng']

const BOOKINGS = [
  { plate: '51G-246.81', service: 'Bảo dưỡng 40.000 km', time: '08:30 · Thứ Bảy' },
  { plate: '30A-579.12', service: 'Thay má phanh trước', time: '14:00 · Chủ nhật' },
  { plate: '29H-118.06', service: 'Vệ sinh điều hòa', time: '09:30 · Thứ Hai' },
  { plate: '43A-320.45', service: 'Thay lốp, cân bằng', time: '16:00 · Thứ Ba' },
]

// Video demo: quay lại từ chính các mẫu (cuộn trang), cùng một đoạn video xưởng.
const DEMOS = [
  { type: 'video', src: '/videos/demo-autopro.mp4', poster: '/videos/demo-autopro.jpg', title: 'Mẫu AutoPro Garage trên máy tính', caption: 'Website gara ô tô: dịch vụ, bảng giá theo km, tra cứu, đặt lịch' },
  { type: 'video', src: '/videos/demo-motofix.mp4', poster: '/videos/demo-motofix.jpg', title: 'Mẫu MotoFix 247 trên điện thoại', caption: 'Hơn 80% khách tìm tiệm sửa xe bằng điện thoại' },
  { type: 'video', src: '/videos/demo-ceramic.mp4', poster: '/videos/demo-ceramic.jpg', title: 'Landing page tặng kèm: Ceramic Studio', caption: 'Một ưu đãi, video xưởng, đếm ngược, form giữ suất' },
]

const SHOP_VIDEO = { src: '/videos/mk-13270.mp4', poster: '/videos/mk-13270.jpg', title: 'Video tại xưởng' }

function Rotator() {
  const i = useCycle(WORDS.length, 2600)
  return (
    <span className="hh-rot" aria-hidden="true">
      <span className="hh-rot__word" key={i}>
        {WORDS[i]}
      </span>
    </span>
  )
}

function BookingToast() {
  const i = useCycle(BOOKINGS.length, 3800)
  const b = BOOKINGS[i]
  return (
    <div className="hh-card hh-toast" aria-hidden="true">
      <span className="hh-toast__icon">
        <Icon name="CalendarCheck" size={18} />
      </span>
      <div className="hh-toast__body" key={i}>
        <b>
          Lịch hẹn mới <span className="hh-plate">{b.plate}</span>
        </b>
        <small>
          {b.service} · {b.time}
        </small>
      </div>
    </div>
  )
}

export default function HomeHero() {
  const [demo, setDemo] = useState(null)
  const stageRef = useRef(null)

  // Hiệu ứng chiều sâu: các lớp dịch nhẹ theo con trỏ chuột.
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const el = stageRef.current
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }
  const onLeave = () => {
    stageRef.current?.style.setProperty('--mx', 0)
    stageRef.current?.style.setProperty('--my', 0)
  }

  return (
    <section className="hh">
      <div className="hh__bg" aria-hidden="true" />
      <div className="wrap hh__grid">
        <div className="hh__copy">
          <Link to="/mau-landing-page" className="hh__badge">
            <b>Tặng</b>
            Landing page quảng cáo trị giá {formatVND(site.promo.giftValue)}
            <Icon name="ArrowRight" size={15} />
          </Link>

          <h1 className="hh__title">
            <span className="sr-only">Website cho {WORDS.join(', ')}: khách tự đặt lịch.</span>
            <span aria-hidden="true">Website cho</span>
            <Rotator />
            <span aria-hidden="true">khách tự đặt lịch.</span>
          </h1>

          <p className="hh__lead">
            {templates.length} mẫu dựng sẵn cho ngành sửa chữa xe, có bảng giá, đặt lịch theo chi nhánh và video xưởng. Bàn giao trong 7 ngày, tặng
            kèm landing page quảng cáo.
          </p>

          <div className="hh__cta">
            <Link to="/mau-website" className="btn btn--signal btn--lg">
              Xem {templates.length} mẫu website <Icon name="ArrowRight" size={18} />
            </Link>
            <button type="button" className="hh-play" onClick={() => setDemo(0)}>
              <span className="hh-play__btn">
                <Icon name="Play" size={18} />
              </span>
              <span className="hh-play__text">
                <b>Xem video demo</b>
                <small>{DEMOS.length} video · khoảng 1 phút</small>
              </span>
            </button>
          </div>

          <ul className="hh__trust">
            <li>
              <Icon name="BadgeCheck" size={18} /> Bàn giao trong 7 ngày
            </li>
            <li>
              <Icon name="ShieldCheck" size={18} /> Bảo hành 12 tháng
            </li>
            <li>
              <Icon name="MapPin" size={18} /> {site.showrooms} showroom {site.brand}
            </li>
          </ul>
        </div>

        <div className="hh-stage" ref={stageRef} onPointerMove={onMove} onPointerLeave={onLeave} aria-label="Ví dụ website trên máy tính, điện thoại và video xưởng">
          <div className="hh-layer hh-layer--video" style={{ '--depth': 8 }}>
            <div className="hh-card hh-video">
              <AutoVideo video={SHOP_VIDEO} />
              <span className="hh-video__chip">
                <i /> Video xưởng phát ngay trên website
              </span>
            </div>
          </div>
          <div className="hh-layer hh-layer--browser" style={{ '--depth': 16 }}>
            <div className="hh-card hh-browser">
              <div className="hh-browser__bar">
                <i /> <i /> <i />
                <span>
                  <Icon name="ShieldCheck" size={11} /> autopro-garage.vn
                </span>
              </div>
              <LivePreview slug="autopro" palette={2} auto title="Mẫu AutoPro Garage trên máy tính" />
            </div>
          </div>
          <div className="hh-layer hh-layer--phone" style={{ '--depth': 26 }}>
            <div className="hh-card hh-phone">
              <LivePreview slug="motofix" device="mobile" title="Mẫu MotoFix 247 trên điện thoại" />
            </div>
          </div>
          <div className="hh-layer hh-layer--toast" style={{ '--depth': 20 }}>
            <BookingToast />
          </div>
        </div>
      </div>

      {demo !== null && (
        <div className="lp-scope">
          <Lightbox items={DEMOS} index={demo} onClose={() => setDemo(null)} onIndex={setDemo} />
        </div>
      )}
    </section>
  )
}
