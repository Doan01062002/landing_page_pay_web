import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import TemplateCard from '../components/TemplateCard.jsx'
import LpCard from '../components/LpCard.jsx'
import { landings } from '../data/landings.js'
import ConsultForm from '../components/ConsultForm.jsx'
import { useConsult } from '../components/ConsultContext.jsx'
import { CountUp, motionAllowed, useCycle } from '../components/Motion.jsx'
import HomeHero from '../components/HomeHero.jsx'
import { templates } from '../data/templates.js'
import { segments, steps, packages, testimonials, faqs } from '../data/landing.js'
import { site, formatVND } from '../data/site.js'
import '../styles/landing.css'

const featured = ['autopro', 'vinfast', 'xpander', 'xeluot', 'motofix', 'shine'].map((s) => templates.find((t) => t.slug === s))

const SLOT_LIST = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30']
const SLOT_FREE = [0, 1, 2, 4, 5]
function SlotsDemo() {
  const i = useCycle(SLOT_FREE.length, 1600)
  const picked = SLOT_FREE[(i + 1) % SLOT_FREE.length]
  return (
    <div className="slots" aria-hidden="true">
      {SLOT_LIST.map((s, k) => (
        <span key={s} className={k === picked ? 'is-picked' : k === 3 ? 'is-full' : ''}>
          {s}
        </span>
      ))}
    </div>
  )
}

// Gõ biển số từng ký tự rồi hiện kết quả, lặp lại.
function LookupDemo() {
  const full = '30A-123.45'
  const [n, setN] = useState(full.length)
  useEffect(() => {
    if (!motionAllowed()) return
    let k = full.length
    let id
    const step = () => {
      k = k > full.length + 14 ? 0 : k + 1
      setN(Math.min(k, full.length))
      id = setTimeout(step, k === 0 ? 500 : k <= full.length ? 140 : 220)
    }
    id = setTimeout(step, 1500)
    return () => clearTimeout(id)
  }, [])
  const done = n >= full.length
  return (
    <div className="lookup-mock" aria-hidden="true">
      <span className="lookup-mock__input">
        {full.slice(0, n)}
        {!done && <i className="caret" />}
      </span>
      <span className={'lookup-mock__result' + (done ? '' : ' is-hidden')}>
        Lần cuối: 12/08/2026 · 35.200 km
        <br />
        Mốc tiếp theo: <b>40.000 km</b>
      </span>
    </div>
  )
}

// Đếm ngược thật tới hết tháng 10/2026 (ưu đãi trên landing page mẫu).
const PROMO_END = new Date('2026-10-31T23:59:59+07:00').getTime()
const timeLeft = () => {
  const d = Math.max(0, PROMO_END - Date.now())
  return [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60]
}
function Countdown() {
  const [v, setV] = useState(timeLeft)
  useEffect(() => {
    const id = setInterval(() => setV(timeLeft()), 1000)
    return () => clearInterval(id)
  }, [])
  const labels = ['ngày', 'giờ', 'phút', 'giây']
  return (
    <div className="promo-lp__count" aria-label={`Còn ${v[0]} ngày ${v[1]} giờ`}>
      {v.map((x, i) => (
        <span key={labels[i]}>
          <b key={i === 3 ? x : 'v'} className={i === 3 ? 'tick' : undefined}>
            {String(x).padStart(2, '0')}
          </b>
          {labels[i]}
        </span>
      ))}
    </div>
  )
}

function Segments() {
  return (
    <section className="segments" aria-label="Ngành hàng phù hợp">
      <div className="wrap segments__inner">
        <p className="segments__label">Mẫu dành riêng cho</p>
        <ul className="segments__list" data-stagger="fade">
          {segments.map((s) => (
            <li key={s.label}>
              <Icon name={s.icon} size={18} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="section" id="tinh-nang">
      <div className="wrap">
        <div className="section-head" data-reveal="up">
          <p className="eyebrow">Tính năng có sẵn trong mọi mẫu</p>
          <h2>Làm đúng những việc khách cần khi tìm tiệm sửa xe</h2>
          <p>Khách muốn biết giá, chọn giờ và tìm đường tới tiệm. Mỗi mẫu đều trả lời ba câu hỏi đó ngay trên điện thoại.</p>
        </div>

        <div className="bento" data-stagger="up">
          <article className="bento__item bento__item--wide">
            <div className="bento__text">
              <Icon name="Gauge" size={22} className="bento__icon" />
              <h3>Bảng giá bảo dưỡng theo mốc km</h3>
              <p>Khách thấy trước mỗi mốc gồm những hạng mục gì, giá bao nhiêu. Bạn sửa giá trong trang quản trị.</p>
            </div>
            <div className="mini-table" aria-hidden="true">
              <div className="mini-table__row mini-table__row--head">
                <span>Hạng mục</span>
                <span>10.000 km</span>
                <span>20.000 km</span>
                <span>40.000 km</span>
              </div>
              {[
                ['Thay dầu động cơ', 1, 1, 1],
                ['Thay lọc dầu', 1, 1, 1],
                ['Thay lọc gió điều hòa', 0, 1, 1],
                ['Thay dầu phanh', 0, 0, 1],
              ].map(([label, ...v], r) => (
                <div className="mini-table__row" key={label} style={{ '--r': r }}>
                  <span>{label}</span>
                  {v.map((x, i) => (
                    <span key={i} className={x ? 'is-on' : 'is-off'}>
                      {x ? <Icon name="Check" size={14} strokeWidth={3} /> : <Icon name="Minus" size={14} />}
                    </span>
                  ))}
                </div>
              ))}
              <div className="mini-table__row mini-table__row--price">
                <span>Trọn gói</span>
                <span>1.150.000đ</span>
                <span>1.890.000đ</span>
                <span>3.450.000đ</span>
              </div>
            </div>
          </article>

          <article className="bento__item">
            <Icon name="CalendarCheck" size={22} className="bento__icon" />
            <h3>Đặt lịch theo chi nhánh</h3>
            <p>Khách chọn chi nhánh, dịch vụ và khung giờ còn trống.</p>
            <SlotsDemo />
          </article>

          <article className="bento__item">
            <Icon name="History" size={22} className="bento__icon" />
            <h3>Tra cứu theo biển số</h3>
            <p>Khách nhập biển số để xem lần bảo dưỡng gần nhất và mốc tiếp theo.</p>
            <LookupDemo />
          </article>

          <article className="bento__item">
            <Icon name="MapPin" size={22} className="bento__icon" />
            <h3>Trang riêng cho từng chi nhánh</h3>
            <p>Địa chỉ, giờ mở cửa, số điện thoại và nút chỉ đường cho mỗi điểm trong chuỗi.</p>
          </article>

          <article className="bento__item">
            <Icon name="Search" size={22} className="bento__icon" />
            <h3>Dễ tìm thấy trên Google</h3>
            <p>Cấu trúc chuẩn SEO địa phương cho các từ khóa như “sửa xe gần đây”.</p>
            <div className="serp" aria-hidden="true">
              <span className="serp__url">autopro-garage.vn › chi-nhanh › binh-thanh</span>
              <span className="serp__title">Gara ô tô Bình Thạnh – Bảo dưỡng từ 690.000đ</span>
            </div>
          </article>

          <article className="bento__item">
            <Icon name="Phone" size={22} className="bento__icon" />
            <h3>Nút gọi & Zalo luôn hiện</h3>
            <p>Trên điện thoại, khách bấm một lần là gọi hoặc nhắn được cho tiệm.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

function FeaturedTemplates() {
  return (
    <section className="section section--mist" id="mau">
      <div className="wrap">
        <div className="section-head section-head--row" data-reveal="up">
          <div>
            <p className="eyebrow">Kho mẫu phần mềm</p>
            <h2>Mẫu dựng sẵn cho từng loại hình kinh doanh xe</h2>
            <p>Bấm “Xem thử” để trải nghiệm như khách hàng của bạn, trên máy tính, máy tính bảng và điện thoại.</p>
          </div>
          <Link to="/mau-phan-mem" className="btn btn--primary">
            Xem tất cả {templates.length} mẫu <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
        <div className="tgrid" data-stagger="up">
          {featured.map((t) => (
            <TemplateCard key={t.slug} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

const COMPARE_ROWS = [
  ['Mục tiêu', 'Giới thiệu đầy đủ, nhận đặt lịch', 'Lấy số điện thoại khách quan tâm'],
  ['Số trang', '6 – 9 trang + trang quản trị', '1 trang, 1 nút đăng ký'],
  ['Khách đến từ', 'Google, Facebook, khách quen', 'Quảng cáo Facebook, Google, TikTok'],
  ['Thời gian dùng', 'Nhiều năm', 'Theo từng đợt khuyến mãi'],
]
const SITEMAP = ['Giới thiệu', 'Dịch vụ', 'Bảng giá', 'Chi nhánh', 'Tin tức', 'Liên hệ']
const FLOW = [
  { icon: 'Target', title: 'Chạy quảng cáo', text: 'Facebook, Google, TikTok' },
  { icon: 'Gift', title: 'Landing page', text: 'Khách xem đúng ưu đãi' },
  { icon: 'Phone', title: 'Để lại số điện thoại', text: 'Gara gọi lại tư vấn' },
  { icon: 'Monitor', title: 'Phần mềm', text: 'Xem thêm dịch vụ, đặt lịch' },
]

function WebVsLanding() {
  return (
    <section className="section" id="so-sanh">
      <div className="wrap">
        <div className="section-head" data-reveal="up">
          <p className="eyebrow">Phần mềm và landing page</p>
          <h2>Hai công cụ, hai nhiệm vụ khác nhau</h2>
          <p>Bạn nhận cả hai: phần mềm để khách tìm thấy và tin tưởng cửa hàng, landing page để chạy quảng cáo ra số điện thoại.</p>
        </div>

        <div className="vs" data-stagger="up">
          <article className="vs__card">
            <span className="vs__tag">Bạn chọn từ kho mẫu</span>
            <div className="vs__title">
              <span className="vs__icon">
                <Icon name="Monitor" size={22} />
              </span>
              <div>
                <h3>Phần mềm</h3>
                <p>Cửa hàng online lâu dài của gara</p>
              </div>
            </div>
            <div className="vs__art vs__art--site" aria-hidden="true">
              <span className="vs__root">Trang chủ</span>
              <ul>
                {SITEMAP.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <dl className="vs__rows">
              {COMPARE_ROWS.map(([k, a]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{a}</dd>
                </div>
              ))}
            </dl>
            <Link to="/mau-phan-mem" className="vs__link">
              Xem kho mẫu phần mềm <Icon name="ArrowRight" size={16} />
            </Link>
          </article>

          <article className="vs__card vs__card--gift">
            <span className="vs__tag vs__tag--gift">
              <Icon name="Gift" size={13} /> Tặng kèm · 0đ
            </span>
            <div className="vs__title">
              <span className="vs__icon">
                <Icon name="Target" size={22} />
              </span>
              <div>
                <h3>Landing page</h3>
                <p>Trang riêng cho một chương trình quảng cáo</p>
              </div>
            </div>
            <div className="vs__art vs__art--lp" aria-hidden="true">
              <span className="vs__lp-tag">Chỉ trong tháng 10</span>
              <b>Thay dầu giảm 30%</b>
              <span className="vs__lp-count">
                <i>12</i>
                <i>08</i>
                <i>45</i>
              </span>
              <span className="vs__lp-btn">Giữ suất ưu đãi</span>
            </div>
            <dl className="vs__rows">
              {COMPARE_ROWS.map(([k, , b]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>
            <Link to="/mau-landing-page" className="vs__link">
              Xem mẫu landing page <Icon name="ArrowRight" size={16} />
            </Link>
          </article>
        </div>

        <div className="vs-flow" data-reveal="up">
          <p className="vs-flow__label">Hai thứ phối hợp thế nào</p>
          <ol>
            {FLOW.map((s, i) => (
              <li key={s.title}>
                <span className="vs-flow__icon">
                  <Icon name={s.icon} size={18} />
                </span>
                <span>
                  <b>
                    {i + 1}. {s.title}
                  </b>
                  <small>{s.text}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Gift() {
  const { open } = useConsult()
  const campaigns = ['Thay dầu giảm 30%', 'Kiểm tra xe miễn phí mùa mưa', 'Vệ sinh điều hòa 199.000đ', 'Khai trương chi nhánh mới']
  return (
    <section className="section gift" id="qua-tang">
      <div className="wrap gift__grid">
        <div className="gift__copy" data-reveal="left">
          <span className="gift__ribbon">
            <Icon name="Gift" size={16} /> Quà tặng khi triển khai phần mềm
          </span>
          <h2>Thêm 1 landing page quảng cáo cho gara của bạn, miễn phí</h2>
          <p>
            Phần mềm giới thiệu toàn bộ dịch vụ. Landing page tập trung vào <strong>một chương trình</strong> để chạy quảng cáo
            Facebook, Google và thu số điện thoại khách quan tâm.
          </p>
          <div className="gift__campaigns">
            <span>Ví dụ chương trình:</span>
            {campaigns.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          <ul className="checklist" data-stagger="left">
            <li>Thiết kế theo logo, màu sắc của gara</li>
            <li>Form thu tên, số điện thoại, dòng xe</li>
            <li>Gắn sẵn mã đo lường Facebook Pixel, Google Analytics</li>
            <li>Chạy trên tên miền phụ, ví dụ khuyenmai.tengara.vn</li>
          </ul>
          <div className="gift__value" data-reveal="zoom">
            <span>
              Trị giá <s>{formatVND(site.promo.giftValue)}</s>
            </span>
            <strong>0đ</strong>
            <button type="button" className="btn btn--signal" onClick={() => open()}>
              Nhận ưu đãi
            </button>
          </div>
        </div>

        <div className="gift__mock" aria-label="Ví dụ landing page quảng cáo" data-reveal="right">
          <div className="browser">
            <div className="browser__bar">
              <i /> <i /> <i />
              <span>khuyenmai.minhducauto.vn</span>
            </div>
            <div className="promo-lp">
              <div className="promo-lp__hero">
                <span className="promo-lp__tag">Chỉ trong tháng 10</span>
                <h3>
                  Thay dầu tổng hợp
                  <br />
                  <em>giảm 30%</em>
                </h3>
                <p>Tặng kiểm tra 32 hạng mục và rửa xe miễn phí tại Gara Minh Đức Auto.</p>
                <Countdown />
              </div>
              <div className="promo-lp__form">
                <b>Giữ suất ưu đãi</b>
                <span className="promo-lp__input">Họ và tên</span>
                <span className="promo-lp__input">Số điện thoại</span>
                <span className="promo-lp__input">Dòng xe, ví dụ Mazda 3</span>
                <span className="promo-lp__btn">Đăng ký nhận ưu đãi</span>
                <small>Đã có 186 người đăng ký</small>
              </div>
            </div>
          </div>
          <div className="gift__stat">
            <Icon name="Target" size={18} />
            <span>
              <b>
                <CountUp value="312" />
              </b>{' '}
              số điện thoại sau 1 đợt chạy quảng cáo
              <small>Kết quả của một khách hàng chuỗi sửa xe máy</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function GiftTemplates() {
  return (
    <section className="section gift-tpl">
      <div className="wrap">
        <div className="section-head section-head--row" data-reveal="up">
          <div>
            <p className="eyebrow">Mẫu landing page tặng kèm</p>
            <h2>Chọn 1 trong {landings.length} mẫu, có sẵn video và ảnh xưởng</h2>
            <p>Tối giản, một mục tiêu duy nhất là lấy số điện thoại. Chúng tôi thay video, ảnh và ưu đãi bằng nội dung thật của gara bạn.</p>
          </div>
          <Link to="/mau-landing-page" className="btn btn--primary">
            Xem các mẫu landing <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
        <div className="lpg lpg--row" data-stagger="up">
          {landings.map((lp) => (
            <LpCard key={lp.slug} lp={lp} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="section section--mist" id="quy-trinh">
      <div className="wrap">
        <div className="section-head" data-reveal="up">
          <p className="eyebrow">Quy trình triển khai</p>
          <h2>Từ lúc chọn mẫu đến khi phần mềm chạy: 7 ngày</h2>
        </div>
        <ol className="steps" data-stagger="up">
          {steps.map((s, i) => (
            <li key={s.title} className="steps__item">
              <span className="steps__num">{i + 1}</span>
              <span className="steps__day">{s.day}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Pricing() {
  const { open } = useConsult()
  return (
    <section className="section" id="bang-gia">
      <div className="wrap">
        <div className="section-head" data-reveal="up">
          <p className="eyebrow">Bảng giá triển khai</p>
          <h2>Một lần thanh toán, phần mềm là của bạn</h2>
          <p>Gói nào cũng tặng kèm landing page quảng cáo. Giá chưa gồm VAT.</p>
        </div>
        <div className="pricing" data-stagger="up">
          {packages.map((p) => (
            <article key={p.id} className={'plan' + (p.featured ? ' plan--featured' : '')}>
              {p.featured && <span className="plan__flag">Chọn nhiều nhất</span>}
              <h3>{p.name}</h3>
              <p className="plan__fit">{p.fit}</p>
              <p className="plan__price">
                {p.price ? (
                  <>
                    <strong>{formatVND(p.price)}</strong>
                    <span>{p.note}</span>
                  </>
                ) : (
                  <>
                    <strong>Liên hệ</strong>
                    <span>{p.note}</span>
                  </>
                )}
              </p>
              <div className="plan__gift">
                <Icon name="Gift" size={16} /> Tặng {p.gift}
              </div>
              <ul className="checklist checklist--sm">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button type="button" className={'btn btn--block ' + (p.featured ? 'btn--signal' : 'btn--ghost')} onClick={() => open()}>
                {p.price ? `Chọn gói ${p.name}` : 'Nhận báo giá'}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="section section--mist">
      <div className="wrap">
        <div className="section-head" data-reveal="up">
          <p className="eyebrow">Khách hàng nói gì</p>
          <h2>Gara thật, kết quả đo được</h2>
        </div>
        <div className="quotes" data-stagger="up">
          {testimonials.map((t) => (
            <figure key={t.name} className="quote">
              <div className="quote__metric">
                <strong>
                  <CountUp value={t.metric} />
                </strong>
                <span>{t.metricLabel}</span>
              </div>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <b>{t.name}</b>
                <span>{t.role}</span>
                <small>Dùng mẫu {t.template}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="section" id="hoi-dap">
      <div className="wrap faq">
        <div className="section-head" data-reveal="up">
          <p className="eyebrow">Hỏi đáp</p>
          <h2>Câu hỏi chủ gara hay hỏi</h2>
          <p>
            Chưa thấy câu trả lời? Gọi <strong>{site.hotline}</strong>, chúng tôi trả lời trong giờ hành chính.
          </p>
        </div>
        <div className="faq__list" data-stagger="up">
          {faqs.map((f, i) => (
            <details key={f.q} className="faq__item" open={i === 0}>
              <summary>
                {f.q}
                <Icon name="ChevronDown" size={20} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Consult() {
  return (
    <section className="section consult" id="tu-van">
      <div className="wrap consult__grid">
        <div className="consult__copy" data-reveal="left">
          <p className="eyebrow">Nhận tư vấn miễn phí</p>
          <h2>Cho chúng tôi biết về gara của bạn</h2>
          <p>Chuyên viên sẽ gợi ý mẫu phù hợp, báo giá và chương trình landing page nên chạy trước.</p>
          <ol className="consult__next">
            <li>Gọi lại trong 30 phút (giờ hành chính)</li>
            <li>Gửi link mẫu và báo giá qua Zalo</li>
            <li>Chốt nội dung, bắt đầu dựng phần mềm</li>
          </ol>
          <div className="consult__hotline">
            <Icon name="Phone" size={20} />
            <span>
              <small>Hoặc gọi ngay</small>
              <strong>{site.hotline}</strong>
            </span>
          </div>
        </div>
        <div className="consult__card" data-reveal="right">
          <ConsultForm idPrefix="landing" />
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <>
      <HomeHero />
      <Segments />
      <Features />
      <FeaturedTemplates />
      <WebVsLanding />
      <Gift />
      <GiftTemplates />
      <Process />
      <Pricing />
      <Testimonials />
      <Faq />
      <Consult />
    </>
  )
}
