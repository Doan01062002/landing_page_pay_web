// Trang danh sách dùng chung cho mọi chức năng dạng bảng (cấu hình ở schemas.jsx):
// tìm kiếm không dấu, tab trạng thái có đếm số, bộ lọc, sắp xếp, phân trang, chọn nhiều dòng, thao tác nhanh,
// thêm / sửa trong ngăn kéo có kiểm tra dữ liệu, xem chi tiết, xuất CSV, xem dạng lịch tuần hoặc bảng kéo thả.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, Download, Eye, LayoutList, Pencil, Plus, Search, SquareKanban, Trash2, X } from 'lucide-react'
import { useAdmin, useCollection } from '../store.jsx'
import { Badge, Drawer, Empty, Field, PageHead, Pager, Switch, ask, confirm, validate } from '../ui.jsx'
import { downloadCSV, isoDay, nextCode } from '../lib.js'
import { matchText } from '../schemas.jsx'
import { CalendarView, BoardView } from './Views.jsx'
import { DetailBody } from './Details.jsx'

export default function Resource({ schema }) {
  const { site, store, toast } = useAdmin()
  const ctx = useMemo(() => ({ site, store, read: (c) => store.read(c) }), [site, store])
  const rows = useCollection(schema.collection)
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const statusOf = schema.statusOf || ((r) => r[schema.statusField || 'status'])

  const [q, setQ] = useState(params.get('q') || '')
  const [tab, setTab] = useState(params.get('tab') || 'all')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState(schema.defaultSort || null)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [sel, setSel] = useState(() => new Set())
  const [view, setView] = useState('table')
  const [editing, setEditing] = useState(null) // { id|null, values, errors }
  const [viewId, setViewId] = useState(null)

  // mở thẳng một bản ghi từ đường dẫn (?open=<id>&edit=1), dùng khi chuyển từ chức năng khác sang
  useEffect(() => {
    const id = params.get('open')
    if (!id) return
    const r = rows.find((x) => x.id === id)
    if (r) params.get('edit') ? openEdit(r) : setViewId(id)
    params.delete('open')
    params.delete('edit')
    setParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    setQ(params.get('q') || '')
    if (params.get('tab')) setTab(params.get('tab'))
  }, [params])
  useEffect(() => setPage(1), [q, tab, filters, size])

  const filterDefs = (schema.filters || []).map((f) => ({
    ...f,
    opts: f.dynamic ? [...new Set(rows.map((r) => r[f.key]).filter(Boolean))].sort() : typeof f.options === 'function' ? f.options(ctx) : f.options,
  }))

  // tìm + lọc (chưa áp tab) → dùng để đếm số theo tab
  const base = useMemo(() => {
    let list = rows
    if (q.trim()) list = list.filter((r) => matchText(r, schema.search || [], q.trim()))
    for (const f of filterDefs) {
      const v = filters[f.key]
      if (!v) continue
      list = list.filter((r) => (f.test ? f.test(r, v) : String(r[f.key]) === v))
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, filters])

  const counts = useMemo(() => {
    const c = {}
    base.forEach((r) => (c[statusOf(r)] = (c[statusOf(r)] || 0) + 1))
    return c
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base])

  const list = useMemo(() => {
    let l = tab === 'all' ? base : base.filter((r) => statusOf(r) === tab)
    if (sort) {
      const col = schema.columns.find((c) => c.key === sort.key)
      const get = sort.by || (typeof col?.sort === 'function' ? col.sort : (r) => r[sort.key])
      l = [...l].sort((a, b) => {
        const x = get(a)
        const y = get(b)
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'vi')) * sort.dir
      })
    }
    return l
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, tab, sort])

  const pages = Math.max(1, Math.ceil(list.length / size))
  const cur = Math.min(page, pages)
  const pageRows = list.slice((cur - 1) * size, cur * size)
  const viewing = viewId ? rows.find((r) => r.id === viewId) : null

  // ---------- thao tác ----------
  const label = (r) => `${schema.single} ${r.code || r.name || r.title || r.customer || ''}`.trim()
  function openEdit(r) {
    const values = r ? JSON.parse(JSON.stringify(r)) : { ...(schema.defaults ? schema.defaults(ctx) : {}) }
    setEditing({ id: r?.id || null, values, errors: {} })
  }
  function save() {
    const v = editing.values
    const errors = validate(schema.fields, v, ctx)
    if (Object.keys(errors).length) {
      setEditing({ ...editing, errors })
      toast('Vui lòng kiểm tra các trường được đánh dấu', 'danger')
      requestAnimationFrame(() => document.querySelector('.adm-drawer [aria-invalid="true"]')?.focus())
      return
    }
    let data = schema.beforeSave ? schema.beforeSave(v, ctx) : v
    if (schema.codePrefix && !data.code) data = { ...data, code: nextCode(rows, schema.codePrefix) }
    if (editing.id) {
      const prev = rows.find((r) => r.id === editing.id)
      store.update(schema.collection, editing.id, data, label(data))
      schema.afterSave?.({ ...prev, ...data }, prev, ctx)
      toast('Đã lưu thay đổi')
    } else {
      const row = store.add(schema.collection, data, label(data))
      schema.afterSave?.(row, null, ctx)
      toast(`Đã thêm ${label(row)}`)
    }
    setEditing(null)
  }
  async function del(ids) {
    const targets = rows.filter((r) => ids.includes(r.id))
    const block = schema.canDelete?.(targets, ctx)
    if (block) return toast(block, 'danger')
    const ok = await confirm({ title: 'Xoá dữ liệu', text: ids.length > 1 ? `Xoá ${ids.length} ${schema.single}? Không thể hoàn tác.` : `Xoá ${label(targets[0])}? Không thể hoàn tác.`, danger: true, ok: 'Xoá' })
    if (!ok) return
    store.remove(schema.collection, ids, ids.length > 1 ? `${ids.length} ${schema.single}` : label(targets[0]))
    setSel(new Set())
    setViewId(null)
    toast('Đã xoá')
  }
  async function runAction(a, r) {
    if (a.confirm && !(await confirm({ title: a.label, text: a.confirm, danger: a.danger }))) return
    let input
    if (a.ask) {
      input = await ask({ title: `${a.label} – ${r.code || r.name || ''}`, input: a.ask })
      if (input === null) return
    }
    if (a.run) {
      const res = a.run(r, ctx)
      if (res?.toast) toast(res.toast)
      if (res?.go) navigate(`/quan-tri/${site.key}/${res.go}`)
      return
    }
    if (a.patch) {
      const patch = typeof a.patch === 'function' ? a.patch(r, input) : a.patch
      store.update(schema.collection, r.id, patch, `${label(r)}: ${a.label.toLowerCase()}`)
      schema.afterSave?.({ ...r, ...patch }, r, ctx)
    }
    toast(a.toast ? a.toast(r) : `${a.label}: ${r.code || r.name || r.title || ''}`)
  }
  function bulkPatch(patch, text) {
    const ids = [...sel]
    const before = rows.filter((r) => sel.has(r.id))
    store.updateMany(schema.collection, ids, patch, `đã cập nhật ${ids.length} ${schema.single}: ${text}`)
    if (schema.afterSave) before.forEach((r) => schema.afterSave({ ...r, ...patch }, r, ctx))
    setSel(new Set())
    toast(`Đã cập nhật ${ids.length} dòng`)
  }
  function exportCSV() {
    const cols = schema.columns.filter((c) => !c.toggle).map((c) => ({ ...c, csv: c.csv || (c.key === 'status' ? statusOf : (r) => r[c.key]) }))
    downloadCSV(`${site.slug}-${schema.id}-${isoDay()}.csv`, cols, list)
    toast(`Đã xuất ${list.length} dòng ra tệp CSV (mở bằng Excel)`)
  }

  // điền sẵn thông tin khi chọn khách / xe đã có
  function change(key, value) {
    const v = { ...editing.values, [key]: value }
    if (['customer', 'name', 'owner'].includes(key)) {
      const c = store.read('customers').find((x) => x.name === value) || store.read('leads').find((x) => x.name === value)
      if (c) {
        if (!v.phone) v.phone = c.phone
        if ('car' in v || schema.fields.some((f) => f.key === 'car')) v.car = v.car || c.car
        if (schema.fields.some((f) => f.key === 'plate') && !v.plate) v.plate = c.plate
      }
    }
    if (key === 'plate' && schema.collection === 'repairOrders') {
      const veh = store.read('vehicles').find((x) => x.plate === value)
      if (veh) Object.assign(v, { car: v.car || veh.car, customer: v.customer || veh.owner, phone: v.phone || veh.phone, km: v.km || veh.km })
    }
    if (key === 'car') {
      const car = store.read('cars').find((x) => x.name === value)
      if (car) {
        if ('price' in v || schema.fields.some((f) => f.key === 'price')) v.price = car.price
        if (schema.fields.some((f) => f.key === 'carPrice')) v.carPrice = car.price
      }
    }
    const errors = { ...editing.errors }
    delete errors[key]
    setEditing({ ...editing, values: v, errors })
  }

  const allSel = pageRows.length > 0 && pageRows.every((r) => sel.has(r.id))
  const toggleAll = () => setSel((s) => {
    const n = new Set(s)
    pageRows.forEach((r) => (allSel ? n.delete(r.id) : n.add(r.id)))
    return n
  })
  const Ic = schema.icon
  const activeFilters = Object.values(filters).filter(Boolean).length + (q ? 1 : 0)

  return (
    <div className="adm-page">
      <PageHead title={schema.label} sub={`${rows.length.toLocaleString('vi-VN')} ${schema.single}`}>
        <button type="button" className="adm-btn" onClick={exportCSV}>
          <Download size={16} /> Xuất CSV
        </button>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => openEdit(null)}>
          <Plus size={16} /> Thêm {schema.single}
        </button>
      </PageHead>

      {schema.summary && (
        <div className="adm-summary">
          {schema.summary(rows).map((s) => (
            <div key={s.label}>
              <span>{s.label}</span>
              <b>{s.value}</b>
            </div>
          ))}
        </div>
      )}

      <div className="adm-card">
        {schema.statuses && (
          <div className="adm-statustabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>
              Tất cả <span>{base.length}</span>
            </button>
            {schema.statuses.map((s) => (
              <button key={s} type="button" role="tab" aria-selected={tab === s} className={tab === s ? 'is-active' : ''} onClick={() => setTab(s)}>
                {s} <span>{counts[s] || 0}</span>
              </button>
            ))}
          </div>
        )}

        <div className="adm-toolbar">
          <label className="adm-search">
            <Search size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Tìm ${schema.single}…`} aria-label="Tìm kiếm" />
            {q && (
              <button type="button" onClick={() => setQ('')} aria-label="Xoá từ khoá">
                <X size={14} />
              </button>
            )}
          </label>
          {filterDefs.map((f) => (
            <select key={f.key} value={filters[f.key] || ''} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })} aria-label={f.label} className={filters[f.key] ? 'is-set' : ''}>
              <option value="">{f.label}: tất cả</option>
              {(f.opts || []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          {activeFilters > 0 && (
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => (setFilters({}), setQ(''))}>
              Xoá lọc
            </button>
          )}
          {schema.views && (
            <div className="adm-viewswitch" role="group" aria-label="Kiểu xem">
              <button type="button" className={view === 'table' ? 'is-active' : ''} onClick={() => setView('table')} aria-label="Danh sách">
                <LayoutList size={16} />
              </button>
              {schema.views.includes('calendar') && (
                <button type="button" className={view === 'calendar' ? 'is-active' : ''} onClick={() => setView('calendar')} aria-label="Lịch tuần">
                  <CalendarDays size={16} />
                </button>
              )}
              {schema.views.includes('board') && (
                <button type="button" className={view === 'board' ? 'is-active' : ''} onClick={() => setView('board')} aria-label="Bảng kéo thả">
                  <SquareKanban size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {sel.size > 0 && view === 'table' && (
          <div className="adm-bulk">
            <b>Đã chọn {sel.size}</b>
            {schema.statuses && !schema.statusOf && (
              <select defaultValue="" onChange={(e) => e.target.value && bulkPatch({ [schema.statusField || 'status']: e.target.value }, e.target.value)} aria-label="Đổi trạng thái">
                <option value="">Đổi trạng thái…</option>
                {schema.statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            )}
            {(schema.bulk || []).map((b) => (
              <button key={b.label} type="button" className="adm-btn adm-btn--sm" onClick={() => bulkPatch(b.patch, b.label)}>
                {b.label}
              </button>
            ))}
            <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => del([...sel])}>
              <Trash2 size={14} /> Xoá
            </button>
            <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => setSel(new Set())}>
              Bỏ chọn
            </button>
          </div>
        )}

        {view === 'calendar' ? (
          <CalendarView rows={list} cfg={schema.calendar} onOpen={(r) => setViewId(r.id)} onNew={(date, time) => (openEdit(null), setTimeout(() => setEditing((e) => e && { ...e, values: { ...e.values, date, time } })))} />
        ) : view === 'board' ? (
          <BoardView
            rows={list}
            statuses={schema.statuses}
            cfg={schema.board}
            onOpen={(r) => setViewId(r.id)}
            onMove={(r, status) => {
              store.update(schema.collection, r.id, { status }, `${label(r)}: chuyển sang "${status}"`)
              schema.afterSave?.({ ...r, status }, r, ctx)
              toast(`${r.name || r.code} → ${status}`)
            }}
          />
        ) : list.length ? (
          <>
            <div className="adm-tablewrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th className="adm-table__check">
                      <input type="checkbox" checked={allSel} onChange={toggleAll} aria-label="Chọn tất cả trên trang" />
                    </th>
                    {schema.columns.map((c) => (
                      <th key={c.key} className={`${c.align === 'num' ? 'num' : ''} ${c.hideSm ? 'hide-sm' : ''}`}>
                        {c.sort || c.key === sort?.key ? (
                          <button type="button" className="adm-sort" onClick={() => setSort((s) => ({ key: c.key, dir: s?.key === c.key ? -s.dir : -1 }))}>
                            {c.label}
                            <span aria-hidden="true">{sort?.key === c.key ? (sort.dir > 0 ? '▲' : '▼') : '↕'}</span>
                          </button>
                        ) : (
                          c.label
                        )}
                      </th>
                    ))}
                    <th className="adm-table__actions">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const acts = (schema.actions || []).filter((a) => !a.when || a.when(r))
                    return (
                      <tr key={r.id} className={sel.has(r.id) ? 'is-sel' : ''} onClick={(e) => !e.target.closest('button, input, select, a, label') && setViewId(r.id)}>
                        <td className="adm-table__check">
                          <input type="checkbox" checked={sel.has(r.id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n })} aria-label="Chọn dòng" />
                        </td>
                        {schema.columns.map((c) => (
                          <td key={c.key} data-label={c.label} className={`${c.align === 'num' ? 'num' : ''} ${c.main ? 'is-main' : ''} ${c.hideSm ? 'hide-sm' : ''}`}>
                            {c.toggle ? (
                              <Switch checked={r[c.toggle]} onChange={(val) => (store.update(schema.collection, r.id, { [c.toggle]: val }, `${label(r)}: ${val ? 'bật' : 'tắt'} ${c.label.toLowerCase()}`), toast(val ? 'Đã bật' : 'Đã tắt'))} />
                            ) : c.render ? (
                              c.render(r, ctx)
                            ) : (
                              r[c.key] ?? '—'
                            )}
                          </td>
                        ))}
                        <td className="adm-table__actions">
                          {acts[0] && schema.rowQuick !== false && (
                            <button type="button" className={`adm-btn adm-btn--sm ${acts[0].danger ? 'adm-btn--ghost' : 'adm-btn--soft'}`} onClick={() => runAction(acts[0], r)}>
                              {acts[0].label}
                            </button>
                          )}
                          <button type="button" className="adm-iconbtn" onClick={() => setViewId(r.id)} aria-label="Xem chi tiết" title="Xem chi tiết">
                            <Eye size={16} />
                          </button>
                          <button type="button" className="adm-iconbtn" onClick={() => openEdit(r)} aria-label="Sửa" title="Sửa">
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pager page={cur} pages={pages} total={list.length} from={(cur - 1) * size + 1} to={Math.min(cur * size, list.length)} onPage={setPage} size={size} onSize={setSize} />
          </>
        ) : (
          <Empty icon={Ic} title={rows.length ? 'Không có kết quả phù hợp' : `Chưa có ${schema.single}`} text={rows.length ? 'Thử bỏ bớt bộ lọc hoặc đổi từ khoá.' : `Bấm "Thêm ${schema.single}" để tạo mới.`}>
            {rows.length ? (
              <button type="button" className="adm-btn" onClick={() => (setFilters({}), setQ(''), setTab('all'))}>
                Xoá bộ lọc
              </button>
            ) : (
              <button type="button" className="adm-btn adm-btn--primary" onClick={() => openEdit(null)}>
                <Plus size={16} /> Thêm {schema.single}
              </button>
            )}
          </Empty>
        )}
      </div>

      {/* Xem chi tiết */}
      <Drawer
        open={!!viewing}
        onClose={() => setViewId(null)}
        title={viewing ? (viewing.code ? `${schema.label}: ${viewing.code}` : viewing.name || viewing.title || schema.label) : ''}
        wide={schema.detail === 'invoice' || schema.detail === 'customer' || schema.detail === 'vehicle'}
        footer={
          viewing && (
            <>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--danger-text" onClick={() => del([viewing.id])}>
                <Trash2 size={16} /> Xoá
              </button>
              <div className="adm-spacer" />
              {(schema.actions || [])
                .filter((a) => !a.when || a.when(viewing))
                .map((a) => (
                  <button key={a.label} type="button" className={`adm-btn ${a.danger ? 'adm-btn--ghost' : ''}`} onClick={() => runAction(a, viewing)}>
                    {a.label}
                  </button>
                ))}
              <button type="button" className="adm-btn adm-btn--primary" onClick={() => (openEdit(viewing), setViewId(null))}>
                <Pencil size={16} /> Sửa
              </button>
            </>
          )
        }
      >
        {viewing && <DetailBody schema={schema} row={viewing} ctx={ctx} statusOf={statusOf} />}
      </Drawer>

      {/* Thêm / sửa */}
      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Sửa ${label(editing.values)}` : `Thêm ${schema.single}`}
        wide={schema.fields.some((f) => f.type === 'items')}
        footer={
          <>
            <button type="button" className="adm-btn" onClick={() => setEditing(null)}>
              Huỷ
            </button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save}>
              {editing?.id ? 'Lưu thay đổi' : `Thêm ${schema.single}`}
            </button>
          </>
        }
      >
        {editing && (
          <form
            className="adm-form"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
            noValidate
          >
            {editing.values.code && (
              <p className="adm-form__code">
                Mã: <Badge tone="muted">{editing.values.code}</Badge>
              </p>
            )}
            {schema.fields
              .filter((f) => !f.hidden?.(editing.values))
              .map((f) => (
                <Field key={f.key} f={f} value={editing.values[f.key]} onChange={(v) => change(f.key, v)} error={editing.errors[f.key]} ctx={ctx} />
              ))}
            <button type="submit" hidden />
          </form>
        )}
      </Drawer>
    </div>
  )
}
