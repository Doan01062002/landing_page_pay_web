import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import TemplateCard from '../components/TemplateCard.jsx'
import ProjectTile from '../components/ProjectTile.jsx'
import { typeLabel } from '../data/projects.js'
import { useCatalog } from '../lib/siteData.jsx'
import { Seo, ld, useOrigin } from '../lib/seo.jsx'
import '../styles/gallery.css'

// Hình thức: mẫu dựng riêng (trang tĩnh /du-an/<slug>/, luôn xếp trước) hoặc mẫu phần mềm
const forms = [
  { id: 'all', label: 'Tất cả' },
  { id: 'rieng', label: 'Dựng riêng' },
  { id: 'phanmem', label: 'Phần mềm' },
]

// Danh mục rút gọn: gộp các loại hình gần nhau (id loại hình gốc trong data vẫn lọc được qua ?loai=<id>)
const groups = [
  { id: 'all', label: 'Tất cả' },
  { id: 'gara', label: 'Gara, sửa chữa', cats: ['oto', 'son'] },
  { id: 'muaban', label: 'Mua bán xe', cats: ['daily', 'xecu', 'xedien'] },
  { id: 'phukien', label: 'Phụ tùng, phụ kiện', cats: ['phutung', 'lop'] },
  { id: 'detailing', label: 'Rửa xe, detailing', cats: ['detailing'] },
  { id: 'xemay', label: 'Xe máy', cats: ['xemay'] },
]
const catsOf = (id) => (id === 'all' ? null : groups.find((g) => g.id === id)?.cats || [id])

// 3 cột × 3 hàng mỗi trang
const PAGE_SIZE = 9

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
  const { templates, projects } = useCatalog()
  const origin = useOrigin()
  const [params, setParams] = useSearchParams()
  const key = params.get('key') || ''
  const cat = params.get('loai') || 'all'
  const sort = params.get('sort') || 'popular'
  const form = params.get('ht') || 'all'
  const page = Math.max(1, parseInt(params.get('trang'), 10) || 1)
  const cats = catsOf(cat)
  const inCat = (c) => !cats || cats.includes(c)
  const mainRef = useRef(null)
  const [query, setQuery] = useState(key)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => setQuery(key), [key])

  const update = (changes) => {
    const next = new URLSearchParams(params)
    if (!('trang' in changes)) next.delete('trang')
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
      (p) => inCat(p.category) && matches([p.name, typeLabel(p.type), p.summary, ...p.highlights].join(' ')),
    )
    return sort === 'new' ? [...list].reverse() : list
  }, [key, cat, sort, form])

  const results = useMemo(() => {
    if (form === 'rieng') return []
    let list = templates.filter((t) => {
      if (!inCat(t.category)) return false
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
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(page, pages)
  // mẫu dựng riêng luôn đứng trước, rồi tới mẫu phần mềm; cắt theo trang
  const items = [...projectResults.map((p) => ({ kind: 'p', p })), ...results.map((t) => ({ kind: 't', t }))].slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  )
  const goPage = (n) => {
    update({ trang: n > 1 ? String(n) : '' })
    const top = mainRef.current?.getBoundingClientRect().top
    if (top !== undefined && top < 0) window.scrollTo({ top: window.scrollY + top - 96, behavior: 'smooth' })
  }

  const counts = useMemo(() => {
    const all = [...projects, ...templates]
    return Object.fromEntries(groups.map((g) => [g.id, g.cats ? all.filter((t) => g.cats.includes(t.category)).length : all.length]))
  }, [])

  const activeCount = cat !== 'all' ? 1 : 0
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <>
      <Seo
        title="Kho mẫu website & phần mềm ngành ô tô"
        description={`${projects.length + templates.length} mẫu website, landing page và phần mềm dựng sẵn cho gara ô tô, đại lý, showroom xe cũ, cửa hàng phụ kiện. Xem thử trực tiếp, kèm trang quản trị.`}
        path="/mau-phan-mem"
        jsonLd={[
          ld.breadcrumb(origin, [['Trang chủ', '/'], ['Kho mẫu', '/mau-phan-mem']]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Mẫu phần mềm ngành ô tô',
            itemListElement: templates.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${origin}/mau-phan-mem/${t.slug}`, name: t.name })),
          },
        ]}
      />
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
                {groups.map((g) => (
                  <label key={g.id} className="check check--radio">
                    <input id={`loai-${g.id}`} type="radio" name="loai" checked={cat === g.id} onChange={() => update({ loai: g.id })} />
                    <span>
                      {g.label} <small className="g-filters__n">{counts[g.id]}</small>
                    </span>
                  </label>
                ))}
              </div>
            </aside>

            <div className="g-main" ref={mainRef}>
              <div className="g-toolbar">
                <div className="g-forms" role="tablist" aria-label="Hình thức">
                  {forms.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="tab"
                      aria-selected={form === f.id}
                      className={'g-forms__btn' + (form === f.id ? ' is-active' : '')}
                      onClick={() => update({ ht: f.id })}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="g-count sr-only" aria-live="polite">
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
                <>
                  <div className="tgrid tgrid--gallery" data-stagger="up" key={[key, cat, sort, form, current].join('|')}>
                    {items.map((it) =>
                      it.kind === 'p' ? <ProjectTile key={`du-an-${it.p.slug}`} p={it.p} /> : <TemplateCard key={it.t.slug} t={it.t} />,
                    )}
                  </div>
                  {pages > 1 && (
                    <nav className="g-pager" aria-label="Phân trang">
                      <button type="button" className="g-pager__btn" disabled={current === 1} onClick={() => goPage(current - 1)} aria-label="Trang trước">
                        <Icon name="ChevronLeft" size={18} />
                      </button>
                      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={'g-pager__btn' + (n === current ? ' is-active' : '')}
                          aria-current={n === current ? 'page' : undefined}
                          onClick={() => goPage(n)}
                        >
                          {n}
                        </button>
                      ))}
                      <button type="button" className="g-pager__btn" disabled={current === pages} onClick={() => goPage(current + 1)} aria-label="Trang sau">
                        <Icon name="ChevronRight" size={18} />
                      </button>
                      <span className="g-pager__info">
                        {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, total)} / {total} mẫu
                      </span>
                    </nav>
                  )}
                </>
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
