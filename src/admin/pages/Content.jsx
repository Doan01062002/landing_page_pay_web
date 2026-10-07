// Nội dung website: thanh thông báo, banner đầu trang, banner trượt, bố cục trang chủ (bật / tắt, sắp xếp),
// SEO & chia sẻ (xem trước kết quả Google, thẻ Facebook), popup. Bên phải là website đang chạy để đối chiếu.
import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ExternalLink, Monitor, Plus, Smartphone, Trash2 } from 'lucide-react'
import { useAdmin, useDoc } from '../store.jsx'
import { Card, Field, PageHead, Switch, Tabs } from '../ui.jsx'

const TABS = [
  { id: 'hero', label: 'Đầu trang' },
  { id: 'banners', label: 'Banner trượt' },
  { id: 'layout', label: 'Bố cục' },
  { id: 'seo', label: 'SEO & chia sẻ' },
  { id: 'popup', label: 'Popup' },
]

export default function Content() {
  const { site, store, toast } = useAdmin()
  const saved = useDoc('content')
  const [draft, setDraft] = useState(saved)
  const [tab, setTab] = useState('hero')
  const [device, setDevice] = useState('desktop')
  useEffect(() => setDraft(saved), [saved])
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const set = (path, value) => {
    const next = structuredClone(draft)
    const keys = path.split('.')
    let o = next
    keys.slice(0, -1).forEach((k) => (o = o[k]))
    o[keys[keys.length - 1]] = value
    setDraft(next)
  }
  const move = (list, i, d) => {
    const a = [...list]
    ;[a[i], a[i + d]] = [a[i + d], a[i]]
    return a
  }
  // cảnh báo khi rời trang mà chưa lưu
  useEffect(() => {
    if (!dirty) return
    const h = (e) => (e.preventDefault(), (e.returnValue = ''))
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const F = (key, label, type = 'text', extra = {}) => {
    const value = key.split('.').reduce((o, k) => o?.[k], draft)
    return <Field f={{ key: key.replace(/\./g, '-'), label, type, ...extra }} value={value} onChange={(v) => set(key, v)} />
  }

  return (
    <div className="adm-page">
      <PageHead title="Nội dung website" sub="Sửa chữ, ảnh, bố cục và SEO của trang chủ">
        {dirty && <span className="adm-dirty">Có thay đổi chưa lưu</span>}
        <button type="button" className="adm-btn" disabled={!dirty} onClick={() => setDraft(saved)}>
          Hoàn tác
        </button>
        <button
          type="button"
          className="adm-btn adm-btn--primary"
          disabled={!dirty}
          onClick={() => {
            store.setDoc('content', draft, 'đã cập nhật nội dung website')
            toast('Đã lưu nội dung. Bản demo chưa đồng bộ lên website thật.')
          }}
        >
          Lưu thay đổi
        </button>
      </PageHead>
      <div className="adm-grid adm-grid--content">
        <Card>
          <Tabs items={TABS} value={tab} onChange={setTab} />
          <div className="adm-form adm-form--flat">
            {tab === 'hero' && (
              <>
                {F('notice', 'Thanh thông báo trên cùng', 'text', { wide: true, help: 'Để trống để ẩn thanh thông báo' })}
                {F('hero.title', 'Tiêu đề lớn', 'text', { wide: true })}
                {F('hero.subtitle', 'Mô tả ngắn', 'textarea', { wide: true, rows: 3 })}
                {F('hero.cta', 'Chữ trên nút chính')}
                {F('hero.link', 'Nút dẫn tới')}
                {F('hero.image', 'Ảnh nền / ảnh chính', 'image', { wide: true })}
              </>
            )}
            {tab === 'banners' && (
              <div className="adm-field--wide adm-list-edit">
                {draft.banners.map((b, i) => (
                  <div key={b.id} className="adm-list-edit__row">
                    <img src={b.image} alt="" className="adm-thumb adm-thumb--lg" />
                    <div className="adm-list-edit__fields">
                      <input value={b.title} onChange={(e) => set('banners', draft.banners.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} aria-label="Tiêu đề banner" />
                      <input value={b.image} onChange={(e) => set('banners', draft.banners.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)))} aria-label="Đường dẫn ảnh" placeholder="Đường dẫn ảnh" />
                      <input value={b.link} onChange={(e) => set('banners', draft.banners.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))} aria-label="Liên kết" placeholder="Liên kết khi bấm" />
                    </div>
                    <div className="adm-list-edit__ctrl">
                      <Switch checked={b.active} onChange={(v) => set('banners', draft.banners.map((x, j) => (j === i ? { ...x, active: v } : x)))} label="Hiện" />
                      <button type="button" className="adm-iconbtn" disabled={!i} onClick={() => set('banners', move(draft.banners, i, -1))} aria-label="Lên">
                        <ArrowUp size={16} />
                      </button>
                      <button type="button" className="adm-iconbtn" disabled={i === draft.banners.length - 1} onClick={() => set('banners', move(draft.banners, i, 1))} aria-label="Xuống">
                        <ArrowDown size={16} />
                      </button>
                      <button type="button" className="adm-iconbtn" onClick={() => set('banners', draft.banners.filter((_, j) => j !== i))} aria-label="Xoá banner">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="adm-btn" onClick={() => set('banners', [...draft.banners, { id: 'bn' + Date.now(), title: 'Banner mới', image: '', link: '#', active: true }])}>
                  <Plus size={16} /> Thêm banner
                </button>
              </div>
            )}
            {tab === 'layout' && (
              <div className="adm-field--wide adm-list-edit">
                <p className="adm-muted">Bật / tắt và sắp xếp thứ tự các khối trên trang chủ.</p>
                {draft.sections.map((s, i) => (
                  <div key={s.id} className={`adm-list-edit__row adm-list-edit__row--sm ${s.visible ? '' : 'is-off'}`}>
                    <span className="adm-list-edit__n">{i + 1}</span>
                    <b>{s.label}</b>
                    <div className="adm-list-edit__ctrl">
                      <Switch checked={s.visible} onChange={(v) => set('sections', draft.sections.map((x, j) => (j === i ? { ...x, visible: v } : x)))} label={s.visible ? 'Hiện' : 'Ẩn'} />
                      <button type="button" className="adm-iconbtn" disabled={!i} onClick={() => set('sections', move(draft.sections, i, -1))} aria-label="Lên">
                        <ArrowUp size={16} />
                      </button>
                      <button type="button" className="adm-iconbtn" disabled={i === draft.sections.length - 1} onClick={() => set('sections', move(draft.sections, i, 1))} aria-label="Xuống">
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'seo' && (
              <>
                {F('seo.title', `Tiêu đề trang (${draft.seo.title.length}/60 ký tự)`, 'text', { wide: true, help: draft.seo.title.length > 60 ? 'Hơi dài: Google sẽ cắt bớt' : 'Nên 50–60 ký tự' })}
                {F('seo.description', `Mô tả (${draft.seo.description.length}/160 ký tự)`, 'textarea', { wide: true, rows: 3, help: draft.seo.description.length > 160 ? 'Hơi dài: Google sẽ cắt bớt' : 'Nên 120–160 ký tự' })}
                {F('seo.keywords', 'Từ khoá', 'text', { wide: true })}
                {F('seo.image', 'Ảnh khi chia sẻ Facebook / Zalo', 'image', { wide: true })}
                <div className="adm-field--wide">
                  <p className="adm-label">Xem trước trên Google</p>
                  <div className="adm-serp">
                    <span>{location.host + site.siteUrl}</span>
                    <b>{draft.seo.title.slice(0, 62)}</b>
                    <p>{draft.seo.description.slice(0, 160)}</p>
                  </div>
                  <p className="adm-label">Xem trước khi chia sẻ</p>
                  <div className="adm-ogcard">
                    {draft.seo.image && <img src={draft.seo.image} alt="" />}
                    <span>{location.host.toUpperCase()}</span>
                    <b>{draft.seo.title}</b>
                    <p>{draft.seo.description}</p>
                  </div>
                </div>
              </>
            )}
            {tab === 'popup' && (
              <>
                {F('popup.enabled', 'Bật popup khi khách vào trang', 'boolean', { wide: true })}
                {F('popup.title', 'Tiêu đề', 'text', { wide: true })}
                {F('popup.text', 'Nội dung', 'textarea', { wide: true, rows: 3 })}
                {F('popup.cta', 'Chữ trên nút')}
              </>
            )}
          </div>
        </Card>
        <Card
          title="Website hiện tại"
          className="adm-preview"
          pad={false}
          actions={
            <>
              <div className="adm-viewswitch">
                <button type="button" className={device === 'desktop' ? 'is-active' : ''} onClick={() => setDevice('desktop')} aria-label="Máy tính">
                  <Monitor size={16} />
                </button>
                <button type="button" className={device === 'mobile' ? 'is-active' : ''} onClick={() => setDevice('mobile')} aria-label="Điện thoại">
                  <Smartphone size={16} />
                </button>
              </div>
              <a href={site.siteUrl} target="_blank" rel="noreferrer" className="adm-iconbtn" aria-label="Mở website">
                <ExternalLink size={16} />
              </a>
            </>
          }
        >
          <div className={`adm-preview__frame adm-preview__frame--${device}`}>
            <iframe src={site.siteUrl} title="Xem trước website" loading="lazy" />
          </div>
          <p className="adm-preview__note">Bản demo chưa có máy chủ: nội dung lưu trong trình duyệt. Khi triển khai thật, bấm Lưu là website cập nhật ngay.</p>
        </Card>
      </div>
    </div>
  )
}
