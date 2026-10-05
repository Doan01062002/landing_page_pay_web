import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import TemplateCard from '../components/TemplateCard.jsx'
import { templates, categories, featureFilters } from '../data/templates.js'
import { site, formatVND } from '../data/site.js'
import '../styles/gallery.css'

const sorts = [
  { id: 'popular', label: 'Phổ biến nhất' },
  { id: 'new', label: 'Mới nhất' },
  { id: 'price-asc', label: 'Giá thấp đến cao' },
  { id: 'price-desc', label: 'Giá cao đến thấp' },
]

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')

export default function Gallery() {
  const [params, setParams] = useSearchParams()
  const key = params.get('key') || ''
  const cat = params.get('loai') || 'all'
  const sort = params.get('sort') || 'popular'
  const price = params.get('gia') || 'all'
  const feats = params.getAll('tn')
  const [query, setQuery] = useState(key)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => setQuery(key), [key])

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([k, v]) => {
      next.delete(k)
      if (Array.isArray(v)) v.forEach((x) => next.append(k, x))
      else if (v && v !== 'all' && !(k === 'sort' && v === 'popular')) next.set(k, v)
    })
    setParams(next, { replace: true })
  }

  const toggleFeat = (id) => update({ tn: feats.includes(id) ? feats.filter((f) => f !== id) : [...feats, id] })

  const results = useMemo(() => {
    const q = normalize(key.trim())
    let list = templates.filter((t) => {
      if (cat !== 'all' && t.category !== cat) return false
      if (price === 'free' && !t.free) return false
      if (price === 'paid' && t.free) return false
      if (feats.length && !feats.every((f) => t.features.includes(f))) return false
      if (q) {
        const hay = normalize([t.name, t.categoryLabel, t.tagline, t.description].join(' '))
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'new') return b.released.localeCompare(a.released)
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return b.popularity - a.popularity
    })
    return list
  }, [key, cat, price, sort, feats.join(',')])

  const counts = useMemo(() => {
    const c = { all: templates.length }
    templates.forEach((t) => (c[t.category] = (c[t.category] || 0) + 1))
    return c
  }, [])

  const activeCount = feats.length + (price !== 'all' ? 1 : 0)
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <>
      <section className="g-hero">
        <div className="wrap g-hero__inner">
          <nav className="crumbs" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span aria-current="page">Kho mẫu phần mềm</span>
          </nav>
          <h1>Kho mẫu phần mềm ngành ô tô</h1>
          <p>
            {templates.length} mẫu cho gara ô tô, tiệm xe máy, lốp – ắc quy, detailing và phụ tùng. Mẫu nào cũng tặng kèm landing page quảng
            cáo trị giá {formatVND(site.promo.giftValue)}.
          </p>
          <form
            className="g-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              update({ key: query.trim() })
            }}
          >
            <Icon name="Search" size={20} />
            <label htmlFor="g-search-input" className="sr-only">
              Tìm mẫu phần mềm
            </label>
            <input
              id="g-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên mẫu hoặc loại hình, ví dụ: ô tô, lốp, rửa xe"
            />
            {query && (
              <button
                type="button"
                className="g-search__clear"
                aria-label="Xóa từ khóa"
                onClick={() => {
                  setQuery('')
                  update({ key: '' })
                }}
              >
                <Icon name="X" size={16} />
              </button>
            )}
            <button type="submit" className="btn btn--primary">
              Tìm mẫu
            </button>
          </form>
        </div>
      </section>

      <section className="g-body">
        <div className="wrap">
          <div className="g-cats" role="tablist" aria-label="Loại hình">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                className={'g-cat' + (cat === c.id ? ' is-active' : '')}
                onClick={() => update({ loai: c.id })}
              >
                {c.label}
                <span>{counts[c.id] || 0}</span>
              </button>
            ))}
          </div>

          <div className="g-layout">
            <aside className={'g-filters' + (filtersOpen ? ' is-open' : '')} aria-label="Bộ lọc">
              <div className="g-filters__group">
                <h2>Tính năng</h2>
                {featureFilters.map((f) => (
                  <label key={f.id} className="check">
                    <input id={`tn-${f.id}`} type="checkbox" checked={feats.includes(f.id)} onChange={() => toggleFeat(f.id)} />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
              <div className="g-filters__group">
                <h2>Chi phí mẫu</h2>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'free', label: 'Miễn phí' },
                  { id: 'paid', label: 'Trả phí' },
                ].map((p) => (
                  <label key={p.id} className="check check--radio">
                    <input id={`gia-${p.id}`} type="radio" name="gia" checked={price === p.id} onChange={() => update({ gia: p.id })} />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
              <div className="g-filters__help">
                <Icon name="MessageCircle" size={18} />
                <p>
                  Chưa chọn được mẫu? Gọi <strong>{site.hotline}</strong>, chúng tôi gợi ý mẫu theo loại hình của bạn.
                </p>
              </div>
            </aside>

            <div className="g-main">
              <div className="g-toolbar">
                <p className="g-count" aria-live="polite">
                  <strong key={results.length}>{results.length}</strong> mẫu phù hợp
                  {key && (
                    <>
                      {' '}
                      với “<b>{key}</b>”
                    </>
                  )}
                </p>
                <div className="g-toolbar__right">
                  <button type="button" className="btn btn--ghost g-filter-toggle" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
                    <Icon name="SlidersHorizontal" size={16} /> Bộ lọc{activeCount ? ` (${activeCount})` : ''}
                  </button>
                  <label htmlFor="g-sort" className="sr-only">
                    Sắp xếp
                  </label>
                  <select id="g-sort" className="g-sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
                    {sorts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {results.length ? (
                <div className="tgrid tgrid--gallery" data-stagger="up" key={[key, cat, price, sort, feats.join()].join('|')}>
                  {results.map((t) => (
                    <TemplateCard key={t.slug} t={t} />
                  ))}
                </div>
              ) : (
                <div className="g-empty" data-reveal="zoom">
                  <Icon name="Search" size={28} />
                  <h3>Không có mẫu nào khớp bộ lọc</h3>
                  <p>Thử bỏ bớt tính năng đã chọn hoặc tìm bằng từ khóa khác, ví dụ “gara”, “xe máy”.</p>
                  <button type="button" className="btn btn--primary" onClick={clearAll}>
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="g-cta">
        <div className="wrap g-cta__inner">
          <div>
            <h2>Bạn chưa tìm được mẫu phù hợp?</h2>
            <p>Để lại số điện thoại, chuyên viên gợi ý mẫu và báo giá trong 30 phút. Vẫn được tặng landing page quảng cáo.</p>
          </div>
          <Link to="/#tu-van" className="btn btn--signal btn--lg">
            Nhận tư vấn miễn phí
          </Link>
        </div>
      </section>
    </>
  )
}
