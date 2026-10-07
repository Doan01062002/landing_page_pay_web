// Đổi mật khẩu tài khoản đang đăng nhập (đổi xong, các phiên đăng nhập khác bị đăng xuất).
import { useState } from 'react'
import { useAdmin } from '../admin/store.jsx'
import { Card, Field, PageHead } from '../admin/ui.jsx'
import { api } from './api.js'

export default function Account() {
  const { site, toast } = useAdmin()
  const [v, setV] = useState({ current: '', next: '', again: '' })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (x) => (setV((o) => ({ ...o, [k]: x })), setErr((e) => ({ ...e, [k]: undefined })))
  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!v.current) errs.current = 'Nhập mật khẩu hiện tại'
    if (v.next.length < 8 || !/\d/.test(v.next) || !/[a-zA-Z]/.test(v.next)) errs.next = 'Tối thiểu 8 ký tự, có chữ và số'
    if (v.again !== v.next) errs.again = 'Mật khẩu nhập lại không khớp'
    setErr(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await api('POST', '/api/auth/password', { current: v.current, next: v.next })
      setV({ current: '', next: '', again: '' })
      toast('Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.')
    } catch (ex) {
      if (ex.fields) setErr(ex.fields)
      toast(ex.message, 'danger')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="adm-page">
      <PageHead title="Đổi mật khẩu" sub={`${site.me.name} · ${site.me.email}`} />
      <Card>
        <form className="adm-form adm-form--flat adm-form--narrow" onSubmit={submit} noValidate>
          <Field f={{ key: 'current', label: 'Mật khẩu hiện tại', type: 'password', required: true, wide: true }} value={v.current} onChange={set('current')} error={err.current} />
          <Field f={{ key: 'next', label: 'Mật khẩu mới', type: 'password', required: true, wide: true, help: 'Tối thiểu 8 ký tự, có cả chữ và số' }} value={v.next} onChange={set('next')} error={err.next} />
          <Field f={{ key: 'again', label: 'Nhập lại mật khẩu mới', type: 'password', required: true, wide: true }} value={v.again} onChange={set('again')} error={err.again} />
          <div className="adm-field--wide">
            <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
              {busy ? 'Đang lưu…' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
