// Thành phần giao diện dùng chung của trang quản trị.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImagePlus, Star, X } from 'lucide-react'
import { fileToDataURL } from './lib.js'

// ---------- Nhãn trạng thái: màu theo nghĩa ----------
const TONES = [
  ['danger', /huỷ|hủy|không đến|trả hàng|thất bại|từ chối|hết hàng|hết hạn|quá hạn/i],
  ['muted', /ẩn|tạm nghỉ|tạm dừng|nháp/i],
  ['ok', /hoàn thành|hoàn tất|đã giao|đang bán|hiển thị|hoạt động|đã nhập|đã lái thử|giải ngân|đã duyệt|đã thu mua|đang làm việc|đã đăng|đang chạy|đã thanh toán|còn hàng/i],
  ['info', /xác nhận|đang giao|đang thực hiện|đang sửa|đặt cọc|đàm phán|đã liên hệ|ký gửi|chờ giao|hẹn giờ|đã cọc|đã định giá|sắp diễn ra/i],
  ['warn', /chờ|mới|báo giá|hẹn|thẩm định|sắp hết|chưa/i],
]
export const toneOf = (s) => (TONES.find(([, re]) => re.test(String(s || ''))) || ['muted'])[0]
export const Badge = ({ children, tone }) => <span className={`adm-badge adm-badge--${tone || toneOf(children)}`}>{children}</span>

export function Stars({ value = 0 }) {
  return (
    <span className="adm-stars" aria-label={`${value} sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= Math.round(value) ? 'on' : ''} />
      ))}
    </span>
  )
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="adm-pagehead">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="adm-pagehead__actions">{children}</div>}
    </div>
  )
}

export function Card({ title, actions, children, className = '', pad = true }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || actions) && (
        <header className="adm-card__head">
          {title && <h2>{title}</h2>}
          {actions && <div className="adm-card__actions">{actions}</div>}
        </header>
      )}
      <div className={pad ? 'adm-card__body' : ''}>{children}</div>
    </section>
  )
}

export function Kpi({ label, value, delta, icon: Ic, tone = 'brand', hint }) {
  return (
    <div className={`adm-kpi adm-kpi--${tone}`}>
      {Ic && (
        <span className="adm-kpi__ic">
          <Ic size={20} />
        </span>
      )}
      <div>
        <p className="adm-kpi__label">{label}</p>
        <p className="adm-kpi__value">{value}</p>
        {delta !== undefined && delta !== null && (
          <p className={`adm-kpi__delta ${delta >= 0 ? 'up' : 'down'}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}% <span>so với kỳ trước</span>
          </p>
        )}
        {hint && <p className="adm-kpi__hint">{hint}</p>}
      </div>
    </div>
  )
}

export function Tabs({ items, value, onChange, small }) {
  return (
    <div className={`adm-tabs ${small ? 'adm-tabs--sm' : ''}`} role="tablist">
      {items.map((it) => (
        <button key={it.id} type="button" role="tab" aria-selected={value === it.id} className={value === it.id ? 'is-active' : ''} onClick={() => onChange(it.id)}>
          {it.label}
          {it.count !== undefined && <span className="adm-tabs__n">{it.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className={`adm-switch ${disabled ? 'is-disabled' : ''}`}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-switch__ui" aria-hidden="true" />
      {label && <span>{label}</span>}
    </label>
  )
}

export function Empty({ icon: Ic, title, text, children }) {
  return (
    <div className="adm-empty">
      {Ic && <Ic size={30} />}
      <p className="adm-empty__title">{title}</p>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}

// gắn vào khung .adm để dùng được màu thương hiệu (biến CSS) của mẫu
const portalRoot = () => document.querySelector(".adm") || document.body

// ---------- Hộp thoại & ngăn kéo (khoá cuộn nền, Esc để đóng, giữ focus bên trong) ----------
function useModalBehavior(open, onClose, ref) {
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const f = [...ref.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent !== null)
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) (e.preventDefault(), f[f.length - 1].focus())
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) (e.preventDefault(), f[0].focus())
      }
    }
    window.addEventListener('keydown', onKey)
    requestAnimationFrame(() => ref.current?.querySelector('input:not([type=checkbox]), select, textarea, button')?.focus())
    return () => {
      window.removeEventListener('keydown', onKey)
      html.style.overflow = prevOverflow
      prev?.focus?.()
    }
  }, [open, onClose, ref])
}

export function Drawer({ open, onClose, title, children, footer, wide }) {
  const ref = useRef(null)
  useModalBehavior(open, onClose, ref)
  if (!open) return null
  return createPortal(
    <div className="adm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={`adm-drawer ${wide ? 'adm-drawer--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header className="adm-drawer__head">
          <h2>{title}</h2>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>
        <div className="adm-drawer__body">{children}</div>
        {footer && <footer className="adm-drawer__foot">{footer}</footer>}
      </aside>
    </div>,
    portalRoot(),
  )
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null)
  useModalBehavior(open, onClose, ref)
  if (!open) return null
  return createPortal(
    <div className="adm-overlay adm-overlay--center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`adm-modal adm-modal--${size}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header className="adm-drawer__head">
          <h2>{title}</h2>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>
        <div className="adm-modal__body">{children}</div>
        {footer && <footer className="adm-drawer__foot">{footer}</footer>}
      </div>
    </div>,
    portalRoot(),
  )
}

// Hộp xác nhận dùng như promise: const ok = await confirm({ title, text })
// Có input: const v = await ask({ title, label, type, value }) → giá trị nhập, hoặc null nếu huỷ
let confirmSetter = null
export function ConfirmHost() {
  const [state, setState] = useState(null)
  const [val, setVal] = useState('')
  useEffect(() => {
    confirmSetter = (s) => {
      setVal(s.input?.value ?? '')
      setState(s)
    }
    return () => (confirmSetter = null)
  }, [])
  const close = (ok) => {
    state?.resolve(state.input ? (ok ? val : null) : ok)
    setState(null)
  }
  return (
    <Modal
      open={!!state}
      onClose={() => close(false)}
      title={state?.title || 'Xác nhận'}
      size="sm"
      footer={
        <>
          <button type="button" className="adm-btn" onClick={() => close(false)}>
            Huỷ
          </button>
          <button type="button" className={`adm-btn ${state?.danger ? 'adm-btn--danger' : 'adm-btn--primary'}`} onClick={() => close(true)}>
            {state?.ok || 'Đồng ý'}
          </button>
        </>
      }
    >
      {state?.text && <p className="adm-confirm-text">{state.text}</p>}
      {state?.input && (
        <form
          className="adm-field"
          onSubmit={(e) => {
            e.preventDefault()
            close(true)
          }}
        >
          <label htmlFor="adm-ask">{state.input.label}</label>
          <input id="adm-ask" type={state.input.type || 'text'} value={val} onChange={(e) => setVal(e.target.value)} />
        </form>
      )}
    </Modal>
  )
}
export const confirm = (opts) => new Promise((resolve) => (confirmSetter ? confirmSetter({ ...opts, resolve }) : resolve(window.confirm(opts.text))))
export const ask = (opts) => new Promise((resolve) => (confirmSetter ? confirmSetter({ ...opts, input: opts.input, resolve }) : resolve(window.prompt(opts.input?.label, opts.input?.value))))

// ---------- Trường nhập liệu ----------
const PHONE_RE = /^0\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function validate(fields, v, ctx) {
  const err = {}
  for (const f of fields) {
    if (f.hidden?.(v)) continue
    const val = v[f.key]
    const empty = val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length)
    if (f.required && empty) err[f.key] = 'Bắt buộc nhập'
    else if (!empty && f.type === 'phone' && !PHONE_RE.test(String(val).replace(/[\s.]/g, ''))) err[f.key] = 'Số điện thoại 10 số, bắt đầu bằng 0'
    else if (!empty && f.type === 'email' && !EMAIL_RE.test(val)) err[f.key] = 'Email chưa đúng định dạng'
    else if (!empty && ['number', 'money'].includes(f.type) && (isNaN(val) || Number(val) < (f.min ?? 0))) err[f.key] = `Giá trị phải từ ${f.min ?? 0}`
    else if (f.check) {
      const m = f.check(val, v, ctx)
      if (m) err[f.key] = m
    }
  }
  return err
}

export function Field({ f, value, onChange, error, ctx }) {
  const id = `fld-${f.key}`
  const common = { id, 'aria-invalid': !!error, 'aria-describedby': error ? id + '-err' : undefined }
  let input
  const opts = typeof f.options === 'function' ? f.options(ctx) : f.options || []
  switch (f.type) {
    case 'textarea':
      input = <textarea {...common} rows={f.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />
      break
    case 'select':
      input = (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {!f.required && <option value="">— Chọn —</option>}
          {f.required && !value && <option value="">— Chọn —</option>}
          {opts.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      )
      break
    case 'boolean':
      input = <Switch checked={value} onChange={onChange} label={f.switchLabel} />
      break
    case 'money':
    case 'number':
      input = (
        <div className="adm-input-affix">
          <input {...common} type="number" inputMode="numeric" min={f.min ?? 0} step={f.step || (f.type === 'money' ? 1000 : 1)} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
          {(f.suffix || f.type === 'money') && <span>{f.suffix || 'đ'}</span>}
        </div>
      )
      break
    case 'rating':
      input = (
        <div className="adm-rating-input" role="radiogroup" aria-label={f.label}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={value === i} className={i <= value ? 'on' : ''} onClick={() => onChange(i)} aria-label={`${i} sao`}>
              <Star size={20} />
            </button>
          ))}
        </div>
      )
      break
    case 'image':
      input = <ImageInput id={id} value={value} onChange={onChange} />
      break
    case 'tags':
      input = <input {...common} value={(value || []).join(', ')} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="Ngăn cách bằng dấu phẩy" />
      break
    case 'items':
      input = <ItemsInput value={value || []} onChange={onChange} f={f} ctx={ctx} />
      break
    default:
      input = <input {...common} type={f.type === 'phone' ? 'tel' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : f.type === 'password' ? 'password' : 'text'} autoComplete={f.type === 'password' ? 'new-password' : undefined} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} list={f.suggest ? id + '-list' : undefined} />
  }
  return (
    <div className={`adm-field ${f.wide ? 'adm-field--wide' : ''} ${f.type === 'boolean' ? 'adm-field--switch' : ''}`}>
      <label htmlFor={id}>
        {f.label}
        {f.required && <b aria-hidden="true"> *</b>}
      </label>
      {input}
      {f.suggest && (
        <datalist id={id + '-list'}>
          {(typeof f.suggest === 'function' ? f.suggest(ctx) : f.suggest).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
      {f.help && !error && <small className="adm-field__help">{f.help}</small>}
      {error && (
        <small className="adm-field__err" id={id + '-err'}>
          {error}
        </small>
      )}
    </div>
  )
}

function ImageInput({ id, value, onChange }) {
  const [busy, setBusy] = useState(false)
  return (
    <div className="adm-image-input">
      <div className="adm-image-input__preview">{value ? <img src={value} alt="" /> : <ImagePlus size={26} />}</div>
      <div className="adm-image-input__ctrl">
        <input id={id} value={value?.startsWith('data:') ? '(ảnh tải lên)' : value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Dán đường dẫn ảnh…" />
        <label className="adm-btn adm-btn--sm">
          {busy ? 'Đang xử lý…' : 'Tải ảnh lên'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setBusy(true)
              try {
                onChange(await fileToDataURL(file))
              } finally {
                setBusy(false)
              }
            }}
          />
        </label>
        {value && (
          <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => onChange('')}>
            Xoá ảnh
          </button>
        )}
      </div>
    </div>
  )
}

// Dòng hàng / hạng mục (đơn hàng, phiếu sửa chữa, phiếu nhập): chọn từ danh mục hoặc gõ tay
function ItemsInput({ value, onChange, f, ctx }) {
  const catalog = f.catalog ? f.catalog(ctx) : []
  const set = (i, patch) => onChange(value.map((it, j) => (j === i ? { ...it, ...patch } : it)))
  const total = value.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0)
  return (
    <div className="adm-items">
      <table>
        <thead>
          <tr>
            <th>{f.itemLabel || 'Hạng mục'}</th>
            {f.kinds && <th>Loại</th>}
            <th className="num">SL</th>
            <th className="num">Đơn giá</th>
            <th className="num">Thành tiền</th>
            <th aria-label="Xoá" />
          </tr>
        </thead>
        <tbody>
          {value.map((it, i) => (
            <tr key={i}>
              <td>
                <input
                  value={it.name}
                  list="adm-items-catalog"
                  aria-label="Tên hạng mục"
                  onChange={(e) => {
                    const hit = catalog.find((c) => c.name === e.target.value)
                    set(i, hit ? { name: hit.name, price: hit.price, sku: hit.sku, kind: hit.kind || it.kind, image: hit.image } : { name: e.target.value })
                  }}
                />
              </td>
              {f.kinds && (
                <td>
                  <select value={it.kind || f.kinds[0]} onChange={(e) => set(i, { kind: e.target.value })} aria-label="Loại">
                    {f.kinds.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </td>
              )}
              <td className="num">
                <input type="number" min="1" value={it.qty} onChange={(e) => set(i, { qty: Math.max(1, Number(e.target.value) || 1) })} aria-label="Số lượng" />
              </td>
              <td className="num">
                <input type="number" min="0" step="1000" value={it.price} onChange={(e) => set(i, { price: Number(e.target.value) || 0 })} aria-label="Đơn giá" />
              </td>
              <td className="num">{((Number(it.qty) || 0) * (Number(it.price) || 0)).toLocaleString('vi-VN')}đ</td>
              <td>
                <button type="button" className="adm-iconbtn" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xoá dòng">
                  <X size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={f.kinds ? 4 : 3}>
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => onChange([...value, { name: '', qty: 1, price: 0, kind: f.kinds?.[0] }])}>
                + Thêm dòng
              </button>
            </td>
            <td className="num">
              <b>{total.toLocaleString('vi-VN')}đ</b>
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
      <datalist id="adm-items-catalog">
        {catalog.map((c) => (
          <option key={c.name} value={c.name}>
            {c.price ? c.price.toLocaleString('vi-VN') + 'đ' : ''}
          </option>
        ))}
      </datalist>
    </div>
  )
}

// Phân trang
export function Pager({ page, pages, total, from, to, onPage, size, onSize }) {
  if (!total) return null
  const nums = []
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i)
  const withGaps = nums.flatMap((n, i) => (i && n - nums[i - 1] > 1 ? ['…', n] : [n]))
  return (
    <div className="adm-pager">
      <span>
        {from}–{to} / {total}
      </span>
      <div className="adm-pager__nums">
        <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Trang trước">
          ‹
        </button>
        {withGaps.map((n, i) =>
          n === '…' ? (
            <span key={'g' + i}>…</span>
          ) : (
            <button key={n} type="button" className={n === page ? 'is-active' : ''} aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)}>
              {n}
            </button>
          ),
        )}
        <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Trang sau">
          ›
        </button>
      </div>
      {onSize && (
        <select value={size} onChange={(e) => onSize(Number(e.target.value))} aria-label="Số dòng mỗi trang">
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / trang
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
