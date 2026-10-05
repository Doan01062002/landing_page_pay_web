import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'

/*
  Cấu trúc nhiều trang cho website mẫu. Mỗi mẫu tự có các trang tương ứng với dữ liệu của nó:
  mẫu không có bảng giá thì không có trang "Bảng giá", gara 1 chi nhánh thì gộp bản đồ vào "Liên hệ"…
*/
export const PAGE_META = {
  '': { label: 'Trang chủ', icon: 'Store' },
  'gioi-thieu': { label: 'Giới thiệu', icon: 'BadgeCheck', desc: 'Câu chuyện, đội ngũ và cam kết của chúng tôi.' },
  'dich-vu': { label: 'Dịch vụ', icon: 'Wrench', desc: 'Danh sách dịch vụ, giá tham khảo và quy trình làm việc.' },
  'bang-gia': { label: 'Bảng giá', icon: 'Gauge', desc: 'Giá niêm yết, đã gồm công và vật tư. Báo giá chi tiết trước khi làm.' },
  'san-pham': { label: 'Sản phẩm', icon: 'ShoppingCart', desc: 'Sản phẩm chính hãng, giá niêm yết, đặt mua online.' },
  'tra-cuu': { label: 'Tra cứu', icon: 'History', desc: 'Xem lịch sử dịch vụ và mốc bảo dưỡng tiếp theo bằng biển số.' },
  'chi-nhanh': { label: 'Chi nhánh', icon: 'MapPin', desc: 'Địa chỉ, giờ mở cửa và số điện thoại từng chi nhánh.' },
  'tin-tuc': { label: 'Tin tức', icon: 'FileText', desc: 'Mẹo chăm sóc xe, lịch bảo dưỡng và chương trình khuyến mãi.' },
  'dat-lich': { label: 'Đặt lịch', icon: 'CalendarCheck', desc: 'Chọn dịch vụ, chi nhánh và khung giờ phù hợp.' },
  'lien-he': { label: 'Liên hệ', icon: 'Phone', desc: 'Gọi, nhắn tin hoặc ghé trực tiếp. Chúng tôi phản hồi trong giờ làm việc.' },
}

// Danh sách trang của một mẫu, kèm các section hiển thị trên từng trang.
export function getPages(t) {
  const has = (s) => t.sections.includes(s)
  const pages = [{ slug: '', sections: t.sections }]
  pages.push({ slug: 'gioi-thieu', sections: ['about', ...(t.process ? ['process'] : []), ...(t.testimonials.length ? ['testimonials'] : [])] })
  const priceSections = [...(t.priceTable ? ['pricetable'] : []), ...(t.packages ? ['packages'] : [])]
  if (t.services.length) {
    const extra = ['beforeafter', 'process'].filter(has)
    pages.push({ slug: 'dich-vu', sections: ['services', ...extra] })
  }
  if (priceSections.length) pages.push({ slug: 'bang-gia', sections: priceSections })
  if (t.products) pages.push({ slug: 'san-pham', sections: ['products'] })
  if (has('lookup')) pages.push({ slug: 'tra-cuu', sections: ['lookup'] })
  if (t.branches.length > 1) pages.push({ slug: 'chi-nhanh', sections: ['branches'] })
  if (t.news.length) pages.push({ slug: 'tin-tuc', sections: ['newslist'] })
  if (has('booking')) pages.push({ slug: 'dat-lich', sections: ['booking'] })
  pages.push({ slug: 'lien-he', sections: ['contact', ...(t.branches.length === 1 ? ['branches'] : [])] })
  return pages.map((p) => ({ ...p, ...PAGE_META[p.slug] }))
}

/* ---------- Đầu trang con ---------- */
export function PageHeader({ t, page, home }) {
  return (
    <section className="ts-pagehead">
      <div className="ts-wrap">
        <nav className="ts-crumbs" aria-label="Đường dẫn">
          <Link to={home}>Trang chủ</Link>
          <Icon name="ArrowRight" size={13} />
          <span aria-current="page">{page.label}</span>
        </nav>
        <h1>{page.slug === 'gioi-thieu' ? `Về ${t.brand.name} ${t.brand.suffix}`.trim() : page.label}</h1>
        <p>{page.desc}</p>
      </div>
    </section>
  )
}

/* ---------- Giới thiệu ---------- */
const VALUES = [
  { icon: 'FileText', title: 'Báo giá trước khi làm', text: 'Gửi báo giá từng hạng mục qua Zalo, khách đồng ý mới làm. Không phát sinh.' },
  { icon: 'BadgeCheck', title: 'Kỹ thuật viên có chứng chỉ', text: 'Đào tạo theo tiêu chuẩn hãng, cập nhật kỹ thuật mới mỗi năm.' },
  { icon: 'ShieldCheck', title: 'Bảo hành rõ ràng', text: 'Phiếu bảo hành ghi rõ thời hạn cho công thợ và từng phụ tùng.' },
]

export function About({ t }) {
  const gallery = [t.hero.image, ...t.services.filter((s) => s.image).map((s) => s.image), ...(t.products || []).map((p) => p.image)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)
  return (
    <section className="ts-section" id="about">
      <div className="ts-wrap ts-about">
        <div className="ts-about__media" data-reveal="left">
          {gallery.map((src, i) => (
            <img key={src} src={src} alt="" loading="lazy" className={i === 0 ? 'is-main' : ''} />
          ))}
        </div>
        <div className="ts-about__copy" data-reveal="right">
          <p className="ts-eyebrow">{t.hero.eyebrow}</p>
          <h2>{t.hero.title}</h2>
          <p>
            {`${t.brand.name} ${t.brand.suffix}`.trim()} phục vụ khách hàng tại {t.brand.address}
            {t.branches.length > 1 ? ` với ${t.branches.length} chi nhánh` : ''}. Mỗi chiếc xe đều được tiếp nhận, kiểm tra và báo giá rõ ràng
            trước khi làm, kèm phiếu bảo hành cho công thợ và phụ tùng.
          </p>
          <p>{t.hero.text}</p>
          {t.hero.stats?.length > 0 && (
            <ul className="ts-about__stats">
              {t.hero.stats.map((s) => (
                <li key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="ts-wrap">
        <div className="ts-values" data-stagger="up">
          {VALUES.map((v) => (
            <article key={v.title}>
              <span className="ts-service__icon">
                <Icon name={v.icon} size={22} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Liên hệ ---------- */
export function Contact({ t }) {
  const [v, setV] = useState({ name: '', phone: '', msg: '' })
  const [err, setErr] = useState({})
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))
  const tel = `tel:${t.brand.hotline.replace(/\s/g, '')}`
  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (v.name.trim().length < 2) errs.name = 'Vui lòng nhập họ tên.'
    if (!/^0\d{9}$/.test(v.phone.replace(/[\s.]/g, ''))) errs.phone = 'Số điện thoại gồm 10 số.'
    setErr(errs)
    if (!Object.keys(errs).length) setSent(true)
  }
  return (
    <section className="ts-section" id="contact">
      <div className="ts-wrap ts-contact">
        <div className="ts-contact__cards" data-stagger="up">
          <a href={tel} className="ts-contact__card">
            <Icon name="Phone" size={22} />
            <span>
              <small>Hotline</small>
              <b>{t.brand.hotline}</b>
            </span>
          </a>
          <div className="ts-contact__card">
            <Icon name="MapPin" size={22} />
            <span>
              <small>Địa chỉ</small>
              <b>{t.brand.address}</b>
            </span>
          </div>
          <div className="ts-contact__card">
            <Icon name="Clock" size={22} />
            <span>
              <small>Giờ mở cửa</small>
              <b>{t.brand.hours}</b>
            </span>
          </div>
          <div className="ts-contact__card">
            <Icon name="MessageCircle" size={22} />
            <span>
              <small>Zalo</small>
              <b>{t.brand.hotline}</b>
            </span>
          </div>
        </div>
        <div className="ts-card ts-contact__form" data-reveal="up">
          {sent ? (
            <div className="ts-done" role="status">
              <span className="ts-done__icon">
                <Icon name="Check" size={28} />
              </span>
              <h3>Đã gửi tin nhắn</h3>
              <p>
                Cảm ơn {v.name}. Chúng tôi sẽ gọi lại số {v.phone} trong giờ làm việc.
              </p>
            </div>
          ) : (
            <form className="ts-form" onSubmit={submit} noValidate>
              <h2 className="ts-contact__title">Gửi tin nhắn cho chúng tôi</h2>
              <div className="ts-form__row">
                <div className="ts-field">
                  <label htmlFor="ct-name">Họ tên</label>
                  <input id="ct-name" value={v.name} onChange={set('name')} placeholder="Nguyễn Văn An" aria-invalid={!!err.name} />
                  {err.name && <span className="ts-error">{err.name}</span>}
                </div>
                <div className="ts-field">
                  <label htmlFor="ct-phone">Số điện thoại</label>
                  <input id="ct-phone" value={v.phone} onChange={set('phone')} placeholder="0901 234 567" inputMode="tel" aria-invalid={!!err.phone} />
                  {err.phone && <span className="ts-error">{err.phone}</span>}
                </div>
              </div>
              <div className="ts-field">
                <label htmlFor="ct-msg">Nội dung</label>
                <textarea id="ct-msg" rows={4} value={v.msg} onChange={set('msg')} placeholder="Xe của tôi bị kêu ở gầm khi qua ổ gà…" />
              </div>
              <button type="submit" className="ts-btn ts-btn--p ts-btn--lg ts-btn--block">
                Gửi tin nhắn
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Tin tức (trang danh sách) ---------- */
const MORE_NEWS = [
  { title: 'Khi nào cần thay má phanh? Cách tự kiểm tra tại nhà', date: '07/09/2026', image: '/images/wrench-piston.jpg' },
  { title: 'Ắc quy yếu: dấu hiệu và cách kéo dài tuổi thọ', date: '31/08/2026', image: '/images/battery.jpg' },
  { title: 'Áp suất lốp chuẩn là bao nhiêu? Bơm nitơ có cần không', date: '24/08/2026', image: '/images/tire.jpg' },
]

export function NewsList({ t }) {
  const items = [...t.news, ...MORE_NEWS]
  const [first, ...rest] = items
  return (
    <section className="ts-section" id="news">
      <div className="ts-wrap">
        <article className="ts-feature-news" data-reveal="up">
          <img src={first.image} alt="" />
          <div>
            <small>{first.date} · Nổi bật</small>
            <h2>{first.title}</h2>
            <p>Những dấu hiệu nhỏ như tiếng kêu lạ, đèn báo trên taplo hay xe hao nhiên liệu bất thường thường là cảnh báo sớm. Kiểm tra kịp thời giúp tiết kiệm chi phí sửa chữa lớn về sau.</p>
            <span className="ts-link">
              Đọc tiếp <Icon name="ArrowRight" size={14} />
            </span>
          </div>
        </article>
        <div className="ts-news" data-stagger="up">
          {rest.map((n) => (
            <article key={n.title} className="ts-newscard">
              <img src={n.image} alt="" loading="lazy" />
              <div>
                <small>{n.date}</small>
                <h3>{n.title}</h3>
                <span className="ts-link">
                  Đọc tiếp <Icon name="ArrowRight" size={14} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
