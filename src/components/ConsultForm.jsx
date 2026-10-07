import { useState } from 'react'
import Icon from './Icon.jsx'
import { landings } from '../data/landings.js'
import { useCatalog, useSite } from '../lib/siteData.jsx'

const businessTypes = ['Gara ô tô', 'Tiệm / chuỗi sửa xe máy', 'Lốp & ắc quy', 'Rửa xe, detailing', 'Sơn, gò đồng', 'Phụ tùng', 'Xưởng xe điện', 'Khác']
const branchOptions = ['1 điểm', '2 – 5 chi nhánh', '6 – 10 chi nhánh', 'Trên 10 chi nhánh']

const UTM_KEY = 'ca_utm'
// Ghi nhớ nguồn chiến dịch (utm_*) của lượt truy cập để gắn vào yêu cầu tư vấn
function readUtm() {
  const utm = {}
  try {
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (/^utm_[a-z]+$/.test(k) && v) utm[k] = v.slice(0, 120)
    })
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm))
    else return JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}')
  } catch {
    /* trình duyệt chặn lưu trữ */
  }
  return utm
}

// Không có máy chủ (bản tĩnh): lưu tạm yêu cầu trên trình duyệt để không mất thông tin khách nhập
function saveLocal(lead) {
  try {
    const key = 'chungauto_leads'
    const list = JSON.parse(localStorage.getItem(key) || '[]')
    list.push({ ...lead, createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* bỏ qua khi trình duyệt chặn lưu trữ */
  }
}

// Gửi yêu cầu lên máy chủ → hiện ngay trong trang quản trị /admin. Trả về { ok } hoặc { fields } / { error }.
async function sendLead(values, website) {
  const body = { ...values, website, page: window.location.pathname, utm: readUtm() }
  let res
  try {
    res = await fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json', 'x-ca-csrf': '1' }, body: JSON.stringify(body) })
  } catch {
    saveLocal(values)
    return { ok: true }
  }
  const data = (res.headers.get('content-type') || '').includes('application/json') ? await res.json().catch(() => null) : null
  if (res.ok && data) return { ok: true }
  if (!data) {
    saveLocal(values)
    return { ok: true }
  }
  if (data.fields) return { fields: data.fields }
  return { error: data.message || 'Chưa gửi được yêu cầu, vui lòng thử lại.' }
}

export default function ConsultForm({ defaultTemplate = '', idPrefix = 'cf', compact = false }) {
  const site = useSite()
  const { templates } = useCatalog()
  const [values, setValues] = useState({
    name: '',
    phone: '',
    type: businessTypes[0],
    branches: branchOptions[0],
    template: defaultTemplate,
    note: '',
  })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [website, setWebsite] = useState('')

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (values.name.trim().length < 2) errs.name = 'Nhập họ tên để chúng tôi tiện xưng hô.'
    const phone = values.phone.replace(/[\s.]/g, '')
    if (!/^0\d{9}$/.test(phone)) errs.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    const out = await sendLead({ ...values, phone }, website)
    setLoading(false)
    if (out.ok) setSent(values)
    else if (out.fields) setErrors({ name: out.fields.name, phone: out.fields.phone, form: Object.values(out.fields)[0] })
    else setErrors({ form: out.error })
  }

  if (sent) {
    return (
      <div className="cf-done" role="status">
        <span className="cf-done__icon">
          <Icon name="Check" size={26} strokeWidth={2.6} />
        </span>
        <h3>Đã nhận yêu cầu của {sent.name}</h3>
        <p>
          Chuyên viên sẽ gọi lại số <strong>{sent.phone}</strong> trong khoảng 30 phút (giờ hành chính) để tư vấn
          {sent.template ? <> mẫu <strong>{sent.template}</strong></> : null} và chương trình tặng landing page.
        </p>
        <p className="cf-done__alt">
          Cần gấp? Gọi <strong>{site.hotline}</strong> hoặc nhắn <a href={site.zaloUrl} target="_blank" rel="noreferrer"><strong>{site.zalo}</strong></a>.
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => setSent(null)}>
          Gửi yêu cầu khác
        </button>
      </div>
    )
  }

  return (
    <form className={'cf' + (compact ? ' cf--compact' : '')} onSubmit={submit} noValidate>
      <div className="cf__row">
        <div className="field">
          <label htmlFor={`${idPrefix}-name`}>Họ và tên</label>
          <input id={`${idPrefix}-name`} value={values.name} onChange={set('name')} placeholder="Nguyễn Văn An" autoComplete="name" aria-invalid={!!errors.name} />
          {errors.name && <span className="field__err">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-phone`}>Số điện thoại</label>
          <input id={`${idPrefix}-phone`} value={values.phone} onChange={set('phone')} placeholder="0901 234 567" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} />
          {errors.phone && <span className="field__err">{errors.phone}</span>}
        </div>
      </div>
      <div className="cf__row">
        <div className="field">
          <label htmlFor={`${idPrefix}-type`}>Loại hình kinh doanh</label>
          <select id={`${idPrefix}-type`} value={values.type} onChange={set('type')}>
            {businessTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-branches`}>Số chi nhánh</label>
          <select id={`${idPrefix}-branches`} value={values.branches} onChange={set('branches')}>
            {branchOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-template`}>Mẫu phần mềm quan tâm</label>
        <select id={`${idPrefix}-template`} value={values.template} onChange={set('template')}>
          <option value="">Chưa chọn, cần tư vấn</option>
          <optgroup label="Mẫu phần mềm">
            {templates.map((t) => (
              <option key={t.slug} value={t.name}>
                {t.name} · {t.categoryLabel}
              </option>
            ))}
          </optgroup>
          <optgroup label="Landing page tặng kèm">
            {landings.map((l) => (
              <option key={l.slug} value={`Landing ${l.name}`}>
                Landing {l.name} · {l.campaignType}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      {/* ô bẫy spam: người dùng không thấy, bot tự điền */}
      <div className="cf__hp" aria-hidden="true">
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input id={`${idPrefix}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {!compact && (
        <div className="field">
          <label htmlFor={`${idPrefix}-note`}>Ghi chú (không bắt buộc)</label>
          <textarea id={`${idPrefix}-note`} rows={3} value={values.note} onChange={set('note')} placeholder="Ví dụ: cần bán phụ tùng online, có 3 chi nhánh ở Hà Nội…" />
        </div>
      )}
      {errors.form && !errors.name && !errors.phone && (
        <p className="field__err cf__err" role="alert">
          {errors.form} Hoặc gọi {site.hotline}.
        </p>
      )}
      <button type="submit" className={'btn btn--signal btn--lg btn--block' + (loading ? ' is-loading' : '')} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" /> Đang gửi…
          </>
        ) : (
          <>
            Gửi yêu cầu tư vấn
            <Icon name="ArrowRight" size={18} />
          </>
        )}
      </button>
      <p className="cf__privacy">
        <Icon name="ShieldCheck" size={14} /> Thông tin chỉ dùng để tư vấn, không chia sẻ cho bên thứ ba.
      </p>
    </form>
  )
}
