// Cài đặt website ChungAuto: thông tin liên hệ, thanh khuyến mãi, SEO mặc định. Lưu xong website cập nhật ngay.
import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useAdmin } from '../admin/store.jsx'
import { Card, Field, PageHead, Tabs } from '../admin/ui.jsx'
import { api } from './api.js'

const SITE_FIELDS = [
  ['brand', 'Tên thương hiệu', { required: true }],
  ['tagline', 'Khẩu hiệu ngắn'],
  ['hotline', 'Hotline', { required: true }],
  ['email', 'Email', { type: 'email' }],
  ['zalo', 'Tên Zalo OA'],
  ['zaloUrl', 'Liên kết Zalo', { placeholder: 'https://zalo.me/…' }],
  ['facebookUrl', 'Fanpage Facebook', { placeholder: 'https://facebook.com/…' }],
  ['domain', 'Tên miền'],
  ['address', 'Địa chỉ', { wide: true }],
  ['company', 'Tên công ty · MST', { wide: true }],
  ['showrooms', 'Số showroom / chi nhánh', { type: 'number' }],
  ['logo', 'Đường dẫn logo'],
]
const PROMO_FIELDS = [
  ['label', 'Nhãn khuyến mãi', { placeholder: 'Ưu đãi tháng 10' }],
  ['giftValue', 'Giá trị quà tặng (landing page)', { type: 'money' }],
  ['text', 'Nội dung thanh khuyến mãi', { wide: true, type: 'textarea', rows: 2 }],
]

export default function CaSettings({ canEdit }) {
  const { toast } = useAdmin()
  const [tab, setTab] = useState('site')
  const [saved, setSaved] = useState(null)
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    api('GET', '/api/admin/settings')
      .then((d) => (setSaved(d), setDraft(structuredClone(d))))
      .catch((e) => toast(e.message, 'danger'))
  }, [toast])
  if (!draft) return <div className="adm-loading-rows">Đang tải cài đặt…</div>

  const dirty = JSON.stringify(draft[tab]) !== JSON.stringify(saved[tab])
  const set = (path, v) => {
    const next = structuredClone(draft)
    const k = path.split('.')
    let o = next[tab]
    k.slice(0, -1).forEach((x) => (o = o[x]))
    o[k[k.length - 1]] = v
    setDraft(next)
    setErrors((e) => ({ ...e, [path]: undefined }))
  }
  const get = (path) => path.split('.').reduce((o, k) => o?.[k], draft[tab])
  const F = (path, label, opts = {}) => <Field key={path} f={{ key: path, label, ...opts }} value={get(path)} onChange={(v) => set(path, v)} error={errors[path]} />

  async function save() {
    setBusy(true)
    try {
      const body = tab === 'site' ? { ...draft.site, showrooms: Number(draft.site.showrooms) || 0, promo: { ...draft.site.promo, giftValue: Number(draft.site.promo.giftValue) || 0 } } : draft.seo
      const out = await api('PUT', `/api/admin/settings/${tab}`, body)
      setSaved((s) => ({ ...s, [tab]: out }))
      setDraft((d) => ({ ...d, [tab]: structuredClone(out) }))
      setErrors({})
      toast('Đã lưu. Website đã cập nhật.')
    } catch (e) {
      if (e.fields) setErrors(e.fields)
      toast(e.message, 'danger')
    } finally {
      setBusy(false)
    }
  }

  const seo = draft.seo
  return (
    <div className="adm-page">
      <PageHead title="Cài đặt website" sub="Thông tin hiển thị trên toàn website và kết quả tìm kiếm Google">
        <a href="/" target="_blank" rel="noreferrer" className="adm-btn">
          <ExternalLink size={16} /> Xem website
        </a>
        {canEdit && (
          <>
            <button type="button" className="adm-btn" disabled={!dirty || busy} onClick={() => (setDraft((d) => ({ ...d, [tab]: structuredClone(saved[tab]) })), setErrors({}))}>
              Hoàn tác
            </button>
            <button type="button" className="adm-btn adm-btn--primary" disabled={!dirty || busy} onClick={save}>
              {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </>
        )}
      </PageHead>
      {!canEdit && <p className="adm-note">Tài khoản của bạn chỉ được xem cài đặt.</p>}
      <Card>
        <Tabs
          items={[
            { id: 'site', label: 'Thông tin & khuyến mãi' },
            { id: 'seo', label: 'SEO mặc định' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <fieldset className="adm-form adm-form--flat adm-fieldset" disabled={!canEdit}>
          {tab === 'site' && (
            <>
              {SITE_FIELDS.map(([k, l, o]) => F(k, l, o))}
              <p className="adm-label adm-field--wide">Thanh khuyến mãi đầu trang</p>
              {PROMO_FIELDS.map(([k, l, o]) => F(`promo.${k}`, l, o))}
            </>
          )}
          {tab === 'seo' && (
            <>
              {F('title', `Tiêu đề trang chủ (${seo.title.length}/70 ký tự)`, { wide: true, required: true, help: 'Nên 50–60 ký tự, có từ khoá chính' })}
              {F('description', `Mô tả (${seo.description.length}/300 ký tự)`, { wide: true, type: 'textarea', rows: 3, required: true, help: 'Nên 120–160 ký tự' })}
              {F('image', 'Ảnh khi chia sẻ (1200×630)', { wide: true, type: 'image' })}
              <div className="adm-field--wide">
                <p className="adm-label">Xem trước trên Google</p>
                <div className="adm-serp">
                  <span>{typeof window !== 'undefined' ? window.location.host : ''}</span>
                  <b>{seo.title.slice(0, 62)}</b>
                  <p>{seo.description.slice(0, 160)}</p>
                </div>
              </div>
            </>
          )}
        </fieldset>
      </Card>
    </div>
  )
}
