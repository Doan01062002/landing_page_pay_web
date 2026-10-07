import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ProjectTile from '../components/ProjectTile.jsx'
import { useConsult } from '../components/ConsultContext.jsx'
import { site } from '../data/site.js'
import { projects, projectTypes } from '../data/projects.js'
import '../styles/gallery.css'

const perks = [
  { icon: 'Store', title: 'Nội dung thật của cơ sở', text: 'Ảnh xưởng, đội thợ, mặt tiền, video do gara tự quay. Không dùng ảnh mạng.' },
  { icon: 'Smartphone', title: 'Chạy mượt trên điện thoại', text: 'Phần lớn khách đến từ quảng cáo trên điện thoại: nút gọi, Zalo, chỉ đường luôn trong tầm tay.' },
  { icon: 'CalendarCheck', title: 'Form đặt lịch nhanh', text: 'Khách để lại số điện thoại, chọn dịch vụ và giờ hẹn trong 30 giây.' },
  { icon: 'Zap', title: 'Bàn giao trong vài ngày', text: 'Gửi link cho chủ gara xem trước, chỉnh theo góp ý rồi trỏ tên miền riêng.' },
]

const typeIcon = { all: 'Package', website: 'Monitor', landing: 'Target', software: 'Cpu' }
const statuses = [
  { id: 'all', label: 'Tất cả' },
  { id: 'live', label: 'Đã triển khai' },
  { id: 'demo', label: 'Bản mẫu' },
]
const sorts = [
  { id: 'featured', label: 'Nổi bật' },
  { id: 'new', label: 'Mới nhất' },
  { id: 'az', label: 'Tên A → Z' },
]

// tìm không dấu: "da nang" khớp "Đà Nẵng"
const fold = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')

export default function Projects() {
  const { open } = useConsult()
  const [params, setParams] = useSearchParams()
  const type = params.get('loai') || 'all'
  const status = params.get('tt') || 'all'
  const sort = params.get('sort') || 'featured'
  const [query, setQuery] = useState('')

  const update = (key, value, empty) => {
    const next = new URLSearchParams(params)
    if (value === empty) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  // Chỉ hiện các loại đã có dự án
  const types = useMemo(
    () =>
      projectTypes
        .map((t) => ({ ...t, count: t.id === 'all' ? projects.length : projects.filter((p) => p.type === t.id).length }))
        .filter((t) => t.count > 0),
    [],
  )
  const statusCount = (id) => projects.filter((p) => id === 'all' || (id === 'demo') === !!p.demo).length

  const list = useMemo(() => {
    const q = fold(query.trim())
    const out = projects
      .filter((p) => type === 'all' || p.type === type)
      .filter((p) => status === 'all' || (status === 'demo') === !!p.demo)
      .filter((p) => !q || q.split(/\s+/).every((w) => fold([p.name, p.area, p.client, p.summary, ...p.highlights].join(' ')).includes(w)))
    if (sort === 'new') out.reverse() // dự án thêm sau nằm cuối danh sách
    if (sort === 'az') out.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    return out
  }, [query, type, status, sort])

  const filtered = type !== 'all' || status !== 'all' || query
  const reset = () => {
    setQuery('')
    setParams({}, { replace: true })
  }

  return (
    <>
      <section className="g-hero">
        <div className="wrap g-hero__inner">
          <nav className="crumbs" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span aria-current="page">Dự án đã triển khai</span>
          </nav>
          <h1>Dự án đã triển khai</h1>
          <p>
            Website, landing page và phần mềm chúng tôi đã làm cho gara thật, cùng các bản mẫu để bạn tham khảo. Mỗi dự án chạy trên đường
            dẫn riêng: bấm “Xem thử” để xem trên máy tính và điện thoại, hoặc sao chép link gửi thẳng cho chủ cơ sở.
          </p>
        </div>
      </section>

      <section className="pjs">
        <div className="wrap pjs__in">
          <aside className="pjs__side" aria-label="Bộ lọc dự án">
            <div className="pjs__box">
              <h2>Loại dự án</h2>
              <div className="pjs__kits" role="radiogroup" aria-label="Loại dự án">
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={type === t.id}
                    className={'pjs__kit' + (type === t.id ? ' is-on' : '')}
                    onClick={() => update('loai', t.id, 'all')}
                  >
                    <span className="pjs__ki">
                      <Icon name={typeIcon[t.id] || 'Package'} size={18} />
                    </span>
                    {t.id === 'all' ? 'Tất cả dự án' : t.label}
                    <em>{t.count}</em>
                  </button>
                ))}
              </div>
            </div>
            <div className="pjs__box">
              <h2>Trạng thái</h2>
              <div className="pjs__seg" role="radiogroup" aria-label="Trạng thái dự án">
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={status === s.id}
                    className={status === s.id ? 'is-on' : ''}
                    onClick={() => update('tt', s.id, 'all')}
                  >
                    {s.label}
                    <small>{statusCount(s.id)}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="pjs__help">
              <b>Muốn gara có trang như thế này?</b>
              <p>Gửi ảnh xưởng, hotline và địa chỉ, chúng tôi dựng bản xem trước để bạn duyệt. Gọi {site.hotline}.</p>
              <button type="button" className="btn btn--light" onClick={() => open('Dự án tương tự đã triển khai')}>
                Nhận tư vấn miễn phí
              </button>
            </div>
          </aside>

          <div className="pjs__main">
            <div className="pjs__tools">
              <label className="pjs__search">
                <span className="sr-only">Tìm dự án</span>
                <Icon name="Search" size={18} />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm: gara, landing page, xe điện, Hà Nội…" />
              </label>
              <span className="pjs__res" aria-live="polite">
                <b>{list.length}</b> dự án
              </span>
              <label className="pjs__sort">
                <span className="sr-only">Sắp xếp</span>
                <select value={sort} onChange={(e) => update('sort', e.target.value, 'featured')}>
                  {sorts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {list.length ? (
              <div className="pjs__grid" data-stagger="up" key={[type, status, sort].join('|')}>
                {list.map((p) => (
                  <ProjectTile key={p.slug} p={p} />
                ))}
              </div>
            ) : (
              <div className="pjs__empty">
                Chưa có dự án khớp bộ lọc.{' '}
                {filtered && (
                  <button type="button" className="pjs__link" onClick={reset}>
                    Xoá bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <p className="eyebrow">Dự án nào cũng có</p>
            <h2>Làm cho gara thật, khách thật</h2>
          </div>
          <div className="lpg-perks" data-stagger="up">
            {perks.map((p) => (
              <article key={p.title}>
                <Icon name={p.icon} size={22} />
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="g-cta">
        <div className="wrap g-cta__inner">
          <div>
            <h2>Muốn gara của bạn có trang như thế này?</h2>
            <p>Gửi ảnh xưởng, số hotline và địa chỉ. Chúng tôi dựng bản xem trước để bạn duyệt trước khi trả tiền.</p>
          </div>
          <button type="button" className="btn btn--signal btn--lg" onClick={() => open('Dự án tương tự đã triển khai')}>
            Nhận tư vấn miễn phí
          </button>
        </div>
      </section>
    </>
  )
}
