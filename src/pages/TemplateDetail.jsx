import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import LivePreview from '../components/LivePreview.jsx'
import TemplateCard from '../components/TemplateCard.jsx'
import { useConsult } from '../components/ConsultContext.jsx'
import { getTemplate, templates } from '../data/templates.js'
import { site, formatVND } from '../data/site.js'
import NotFound from './NotFound.jsx'
import { getPages } from '../templates/pages.jsx'
import '../styles/gallery.css'


const formatDate = (iso) => iso.split('-').reverse().join('/')

export default function TemplateDetail() {
  const { slug } = useParams()
  const t = getTemplate(slug)
  const [palette, setPalette] = useState(0)
  const { open } = useConsult()

  if (!t) return <NotFound />
  const pages = getPages(t)

  const related = templates.filter((x) => x.slug !== t.slug).sort((a, b) => (b.category === t.category) - (a.category === t.category) || b.popularity - a.popularity).slice(0, 3)

  return (
    <>
      <section className="d-top">
        <div className="wrap">
          <nav className="crumbs" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/mau-phan-mem">Kho mẫu</Link>
            <span>/</span>
            <Link to={`/mau-phan-mem?loai=${t.category}`}>{t.categoryLabel}</Link>
            <span>/</span>
            <span aria-current="page">{t.name}</span>
          </nav>

          <div className="d-grid">
            <div className="d-preview">
              <div className="d-browser">
                <div className="device-laptop__bar">
                  <i /> <i /> <i />
                  <span>{t.slug}.chungauto.vn</span>
                </div>
                <Link to={`/demo/${t.slug}?c=${palette}`} className="d-browser__link" aria-label={`Xem thử mẫu ${t.name}`}>
                  <LivePreview slug={t.slug} url={t.url} palette={palette} tall title={`Mẫu ${t.name} trên máy tính`} />
                  <span className="d-browser__hint">
                    <Icon name="MousePointerClick" size={18} /> Bấm để xem thử toàn màn hình
                  </span>
                </Link>
              </div>
              <div className="d-phone">
                <LivePreview slug={t.slug} url={t.url} palette={palette} device="mobile" title={`Mẫu ${t.name} trên điện thoại`} />
              </div>
            </div>

            <aside className="d-info">
              <div className="d-info__tags">
                <span className="tcard__cat">{t.categoryLabel}</span>
                {t.isNew && <span className="badge badge--new">Mới</span>}
                {t.free && <span className="badge badge--free">Miễn phí</span>}
              </div>
              <h1>{t.name}</h1>
              <p className="d-info__desc">{t.description}</p>

              <div className="d-info__price">
                {t.free ? (
                  <strong>Miễn phí</strong>
                ) : (
                  <>
                    <small>Triển khai trọn gói từ</small>
                    <strong>{formatVND(t.price)}</strong>
                  </>
                )}
              </div>

              <div className="d-palettes">
                <span>Bộ màu: <b>{t.palettes[palette].name}</b></span>
                <div role="radiogroup" aria-label="Chọn bộ màu">
                  {t.palettes.map((p, i) => (
                    <button
                      key={p.name}
                      type="button"
                      role="radio"
                      aria-checked={palette === i}
                      aria-label={p.name}
                      className={'swatch' + (palette === i ? ' is-active' : '')}
                      onClick={() => setPalette(i)}
                    >
                      <i style={{ background: p.p }} />
                      <i style={{ background: p.a }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="d-actions">
                <button type="button" className="btn btn--signal btn--lg" onClick={() => open(t.name)}>
                  Chọn mẫu này
                </button>
                <Link to={`/demo/${t.slug}?c=${palette}`} className="btn btn--ghost btn--lg">
                  <Icon name="Eye" size={18} /> Xem thử giao diện
                </Link>
              </div>

              <div className="d-gift">
                <Icon name="Gift" size={22} />
                <p>
                  <b>Tặng thêm 1 landing page quảng cáo</b> trị giá {formatVND(site.promo.giftValue)}: trang riêng cho một chương trình khuyến mãi,
                  dùng khi chạy quảng cáo Facebook, Google.{' '}
                  <Link to="/mau-landing-page" className="d-gift__link">
                    Xem 3 mẫu landing
                  </Link>
                </p>
              </div>

              <dl className="d-meta">
                <div>
                  <dt>Số trang</dt>
                  <dd>{pages.length} trang + trang quản trị</dd>
                </div>
                <div>
                  <dt>Thiết bị</dt>
                  <dd>Máy tính, máy tính bảng, điện thoại</dd>
                </div>
                <div>
                  <dt>Cập nhật</dt>
                  <dd>{formatDate(t.released)}</dd>
                </div>
                <div>
                  <dt>Hỗ trợ</dt>
                  <dd>Hotline {site.hotline}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap d-features" data-stagger="up">
          <div>
            <p className="eyebrow">Tính năng nổi bật</p>
            <h2 className="d-h2">Những gì có sẵn trong mẫu {t.name}</h2>
            <ul className="checklist">
              {t.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
              <li>Nút gọi điện, Zalo nổi trên điện thoại</li>
              <li>Tối ưu SEO địa phương, tốc độ tải nhanh</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Phần mềm {pages.length} trang</p>
            <h2 className="d-h2">Các trang có sẵn</h2>
            <ul className="d-pages" data-stagger="fade">
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link to={`/demo/${t.slug}?c=${palette}${p.slug ? `&trang=${p.slug}` : ''}`}>
                    <Icon name={p.icon} size={18} />
                    {p.label}
                    <Icon name="Eye" size={15} className="d-pages__eye" />
                  </Link>
                </li>
              ))}
              <li className="d-pages__admin">
                <span>
                  <Icon name="Settings" size={18} />
                  Trang quản trị
                </span>
              </li>
            </ul>
            <p className="d-pages__note">Bấm vào tên trang để xem thử. Trang quản trị dùng để sửa giá, thêm chi nhánh, đăng tin và xem lịch hẹn.</p>
          </div>
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap">
          <div className="section-head section-head--row" data-reveal="up">
            <div>
              <p className="eyebrow">Có thể bạn quan tâm</p>
              <h2>Mẫu tương tự</h2>
            </div>
            <Link to="/mau-phan-mem" className="btn btn--ghost">
              Xem kho mẫu <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
          <div className="tgrid" data-stagger="up">
            {related.map((r) => (
              <TemplateCard key={r.slug} t={r} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
