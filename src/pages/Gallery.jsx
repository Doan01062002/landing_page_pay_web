import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import TemplateCard from '../components/TemplateCard.jsx'
import ProjectTile from '../components/ProjectTile.jsx'
import { templates, categories } from '../data/templates.js'
import { projects, typeLabel } from '../data/projects.js'
import '../styles/gallery.css'

// Hình thức: mẫu dựng riêng (trang tĩnh /du-an/<slug>/, luôn xếp trước) hoặc mẫu phần mềm
const forms = [
  { id: 'all', label: 'Tất cả' },
  { id: 'rieng', label: 'Mẫu dựng riêng' },
  { id: 'phanmem', label: 'Mẫu phần mềm' },
]

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
  const form = params.get('ht') || 'all'
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

  const matches = (text) => {
    const q = normalize(key.trim())
    return !q || q.split(/\s+/).every((w) => normalize(text).includes(w))
  }

  const projectResults = useMemo(() => {
    if (form === 'phanmem') return []
    const list = projects.filter(
      (p) => (cat === 'all' || p.category === cat) && matches([p.name, typeLabel(p.type), p.summary, ...p.highlights].join(' ')),
    )
    return sort === 'new' ? [...list].reverse() : list
  }, [key, cat, sort, form])

  const results = useMemo(() => {
    if (form === 'rieng') return []
    let list = templates.filter((t) => {
      if (cat !== 'all' && t.category !== cat) return false
      return matches([t.name, t.categoryLabel, t.tagline, t.description].join(' '))
    })
    list = [...list].sort((a, b) => {
      if (sort === 'new') return b.released.localeCompare(a.released)
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return b.popularity - a.popularity
    })
    return list
  }, [key, cat, sort, form])
  const total = projectResults.length + results.length

  const counts = useMemo(() => {
    const c = { all: templates.length + projects.length }
    ;[...projects, ...templates].forEach((t) => (c[t.category] = (c[t.category] || 0) + 1))
    return c
  }, [])

  const activeCount = (cat !== 'all' ? 1 : 0) + (form !== 'all' ? 1 : 0)
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <>
      <section className="g-hero">
        <div className="wrap g-hero__inner">
          <nav className="crumbs" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span aria-current="page">Kho mẫu</span>
          </nav>
          <h1>Kho mẫu ngành ô tô</h1>
          <p>
            {projects.length + templates.length} mẫu website, landing page và phần mềm cho gara, đại lý, cửa hàng phụ kiện ô tô.
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
          <div className="g-layout">
            <aside className={'g-filters' + (filtersOpen ? ' is-open' : '')} aria-label="Bộ lọc">
              <div className="g-filters__group">
                <h2>Danh mục</h2>
                {categories.map((c) => (
                  <label key={c.id} className="check check--radio">
                    <input id={`loai-${c.id}`} type="radio" name="loai" checked={cat === c.id} onChange={() => update({ loai: c.id })} />
                    <span>
                      {c.label} <small className="g-filters__n">{counts[c.id] || 0}</small>
                    </span>
                  </label>
                ))}
              </div>
              <div className="g-filters__group">
                <h2>Hình thức</h2>
                {forms.map((f) => (
                  <label key={f.id} className="check check--radio">
                    <input id={`ht-${f.id}`} type="radio" name="ht" checked={form === f.id} onChange={() => update({ ht: f.id })} />
                    <span>
                      {f.label}{' '}
                      <small className="g-filters__n">
                        {f.id === 'all' ? projects.length + templates.length : f.id === 'rieng' ? projects.length : templates.length}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </aside>

            <div className="g-main">
              <div className="g-toolbar">
                <p className="g-count" aria-live="polite">
                  <strong key={total}>{total}</strong> mẫu phù hợp
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

              {total ? (
                <div className="tgrid tgrid--gallery" data-stagger="up" key={[key, cat, sort, form].join('|')}>
                  {projectResults.map((p) => (
                    <ProjectTile key={`du-an-${p.slug}`} p={p} />
                  ))}
                  {results.map((t) => (
                    <TemplateCard key={t.slug} t={t} />
                  ))}
                </div>
              ) : (
                <div className="g-empty" data-reveal="zoom">
                  <Icon name="Search" size={28} />
                  <h3>Không có mẫu nào khớp bộ lọc</h3>
                  <p>Thử chọn danh mục khác hoặc tìm bằng từ khóa khác, ví dụ “gara”, “xe máy”.</p>
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
