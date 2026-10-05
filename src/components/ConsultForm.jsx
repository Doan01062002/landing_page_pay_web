import { useState } from 'react'
import Icon from './Icon.jsx'
import { templates } from '../data/templates.js'
import { landings } from '../data/landings.js'
import { site } from '../data/site.js'

const businessTypes = ['Gara ô tô', 'Tiệm / chuỗi sửa xe máy', 'Lốp & ắc quy', 'Rửa xe, detailing', 'Sơn, gò đồng', 'Phụ tùng', 'Xưởng xe điện', 'Khác']
const branchOptions = ['1 điểm', '2 – 5 chi nhánh', '6 – 10 chi nhánh', 'Trên 10 chi nhánh']

// Chưa có backend: lưu tạm yêu cầu vào localStorage để dễ nối API sau này.
function saveLead(lead) {
  try {
    const key = 'chungauto_leads'
    const list = JSON.parse(localStorage.getItem(key) || '[]')
    list.push({ ...lead, createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* bỏ qua khi trình duyệt chặn lưu trữ */
  }
}

export default function ConsultForm({ defaultTemplate = '', idPrefix = 'cf', compact = false }) {
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

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (values.name.trim().length < 2) errs.name = 'Nhập họ tên để chúng tôi tiện xưng hô.'
    const phone = values.phone.replace(/[\s.]/g, '')
    if (!/^0\d{9}$/.test(phone)) errs.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    // Giả lập thời gian gửi lên máy chủ
    setLoading(true)
    setTimeout(() => {
      saveLead(values)
      setLoading(false)
      setSent(values)
    }, 700)
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
      {!compact && (
        <div className="field">
          <label htmlFor={`${idPrefix}-note`}>Ghi chú (không bắt buộc)</label>
          <textarea id={`${idPrefix}-note`} rows={3} value={values.note} onChange={set('note')} placeholder="Ví dụ: cần bán phụ tùng online, có 3 chi nhánh ở Hà Nội…" />
        </div>
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
