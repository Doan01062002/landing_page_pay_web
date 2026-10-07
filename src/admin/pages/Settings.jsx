// Cài đặt: thông tin doanh nghiệp, thanh toán, vận chuyển, đặt lịch, thông báo, tích hợp, bảo mật, sao lưu dữ liệu.
import { useEffect, useRef, useState } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { useAdmin, useDoc } from '../store.jsx'
import { Card, Field, PageHead, Tabs, confirm, validate } from '../ui.jsx'
import { downloadJSON, isoDay } from '../lib.js'

export default function Settings() {
  const { site, store, toast } = useAdmin()
  const saved = useDoc('settings')
  const [draft, setDraft] = useState(saved)
  const [errors, setErrors] = useState({})
  const [tab, setTab] = useState('general')
  const fileRef = useRef(null)
  useEffect(() => setDraft(saved), [saved])
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const tabs = [
    { id: 'general', label: 'Thông tin chung' },
    { id: 'payment', label: 'Thanh toán' },
    site.profile !== 'gara' && { id: 'shipping', label: site.profile === 'shop' ? 'Vận chuyển' : 'Giao xe' },
    { id: 'booking', label: 'Đặt lịch' },
    { id: 'notify', label: 'Thông báo' },
    { id: 'integrations', label: 'Tích hợp' },
    { id: 'security', label: 'Bảo mật' },
    { id: 'data', label: 'Dữ liệu' },
  ].filter(Boolean)

  const set = (path, v) => {
    const next = structuredClone(draft)
    const k = path.split('.')
    let o = next
    k.slice(0, -1).forEach((x) => (o = o[x]))
    o[k[k.length - 1]] = v
    setDraft(next)
  }
  const get = (path) => path.split('.').reduce((o, k) => o?.[k], draft)
  const F = (path, label, type = 'text', extra = {}) => <Field f={{ key: path, label, type, ...extra }} value={get(path)} onChange={(v) => set(path, v)} error={errors[path]} />

  const GENERAL = [
    { key: 'name', label: 'Tên hiển thị', required: true },
    { key: 'hotline', label: 'Hotline', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
  ]
  function save() {
    const err = validate(GENERAL, draft)
    setErrors(err)
    if (Object.keys(err).length) return toast('Vui lòng kiểm tra thông tin bắt buộc', 'danger')
    store.setDoc('settings', draft, 'đã cập nhật cài đặt')
    toast('Đã lưu cài đặt')
  }

  return (
    <div className="adm-page">
      <PageHead title="Cài đặt" sub="Cấu hình chung cho website và trang quản trị">
        {dirty && <span className="adm-dirty">Có thay đổi chưa lưu</span>}
        <button type="button" className="adm-btn" disabled={!dirty} onClick={() => (setDraft(saved), setErrors({}))}>
          Hoàn tác
        </button>
        <button type="button" className="adm-btn adm-btn--primary" disabled={!dirty} onClick={save}>
          Lưu cài đặt
        </button>
      </PageHead>
      <Card>
        <Tabs items={tabs} value={tab} onChange={setTab} />
        <div className="adm-form adm-form--flat">
          {tab === 'general' && (
            <>
              {F('name', 'Tên hiển thị', 'text', { required: true })}
              {F('legalName', 'Tên pháp lý (xuất hoá đơn)')}
              {F('taxCode', 'Mã số thuế')}
              {F('hotline', 'Hotline', 'text', { required: true })}
              {F('email', 'Email nhận thông báo', 'email', { required: true })}
              {F('hours', 'Giờ mở cửa')}
              {F('address', 'Địa chỉ', 'text', { wide: true })}
              {F('website', 'Địa chỉ website', 'text', { wide: true })}
              {F('social.facebook', 'Fanpage Facebook')}
              {F('social.zalo', 'Zalo')}
              {F('social.youtube', 'Kênh YouTube')}
              {F('social.tiktok', 'TikTok')}
            </>
          )}
          {tab === 'payment' && (
            <>
              {F('payment.cod', site.profile === 'shop' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán tại quầy', 'boolean', { wide: true })}
              {F('payment.bank', 'Chuyển khoản ngân hàng', 'boolean', { wide: true })}
              {get('payment.bank') && (
                <>
                  {F('payment.bankName', 'Ngân hàng')}
                  {F('payment.bankAccount', 'Số tài khoản')}
                  {F('payment.bankHolder', 'Chủ tài khoản', 'text', { wide: true })}
                </>
              )}
              {F('payment.vnpay', 'Cổng VNPAY (thẻ ATM, QR)', 'boolean', { wide: true, help: 'Cần mã kết nối do VNPAY cấp khi triển khai thật' })}
              {F('payment.momo', 'Ví MoMo', 'boolean', { wide: true })}
              {site.profile !== 'gara' && F('payment.installment', 'Trả góp qua thẻ tín dụng / công ty tài chính', 'boolean', { wide: true })}
            </>
          )}
          {tab === 'shipping' && (
            <>
              {F('shipping.fee', site.profile === 'shop' ? 'Phí giao hàng mặc định' : 'Phí giao xe tận nhà', 'money')}
              {F('shipping.freeFrom', 'Miễn phí cho đơn từ', 'money')}
              {site.profile === 'shop' && F('shipping.ghn', 'Kết nối Giao Hàng Nhanh', 'boolean', { wide: true })}
              {site.profile === 'shop' && F('shipping.ghtk', 'Kết nối Giao Hàng Tiết Kiệm', 'boolean', { wide: true })}
              {F('shipping.inner', 'Giao nội thành bằng nhân viên cửa hàng', 'boolean', { wide: true })}
            </>
          )}
          {tab === 'booking' && (
            <>
              {F('booking.open', 'Nhận lịch từ', 'time')}
              {F('booking.close', 'Đến', 'time')}
              {F('booking.slot', 'Mỗi khung giờ (phút)', 'select', { options: ['15', '30', '45', '60'] })}
              {F('booking.perSlot', 'Số xe tối đa mỗi khung', 'number', { min: 1 })}
              {F('booking.days', 'Cho đặt trước tối đa (ngày)', 'number', { min: 1 })}
              {F('booking.autoConfirm', 'Tự xác nhận lịch đặt online', 'boolean', { wide: true, help: 'Tắt: nhân viên gọi xác nhận trước khi chốt lịch' })}
            </>
          )}
          {tab === 'notify' && (
            <>
              <p className="adm-label adm-field--wide">Kênh nhận thông báo</p>
              {F('notify.email', 'Email', 'boolean')}
              {F('notify.zalo', 'Zalo OA', 'boolean')}
              {F('notify.sms', 'SMS', 'boolean')}
              <p className="adm-label adm-field--wide">Báo khi có</p>
              {F('notify.newOrder', site.profile === 'gara' ? 'Phiếu / báo giá mới' : site.profile === 'shop' ? 'Đơn hàng mới' : 'Khách quan tâm mới', 'boolean')}
              {F('notify.newBooking', 'Lịch hẹn mới', 'boolean')}
              {F('notify.newReview', 'Đánh giá mới', 'boolean')}
              {site.profile !== 'showroom' && F('notify.lowStock', 'Hàng sắp hết', 'boolean')}
              {F('notify.daily', 'Báo cáo tổng kết cuối ngày', 'boolean')}
            </>
          )}
          {tab === 'integrations' && (
            <>
              {F('integrations.fbPixel', 'Facebook Pixel ID', 'text', { placeholder: 'VD: 1234567890' })}
              {F('integrations.ga4', 'Google Analytics 4', 'text', { placeholder: 'G-XXXXXXX' })}
              {F('integrations.zaloOA', 'Zalo Official Account ID')}
              {F('integrations.gmaps', 'Liên kết Google Maps', 'text', { wide: true })}
              {F('integrations.chat', 'Nút chat nổi', 'select', { options: ['Zalo', 'Messenger', 'Cả hai', 'Tắt'] })}
            </>
          )}
          {tab === 'security' && (
            <>
              {F('security.twoFactor', 'Bắt buộc xác thực 2 lớp cho quản trị viên', 'boolean', { wide: true })}
              {F('security.sessionHours', 'Tự đăng xuất sau (giờ)', 'number', { min: 1 })}
              {F('security.ipLock', 'Chỉ cho đăng nhập từ mạng của cửa hàng', 'boolean', { wide: true })}
              <div className="adm-field--wide adm-note">Bản demo chưa có máy chủ xác thực: các tuỳ chọn bảo mật được lưu lại để minh hoạ, sẽ có hiệu lực khi triển khai.</div>
            </>
          )}
          {tab === 'data' && (
            <div className="adm-field--wide adm-datatools">
              <div>
                <b>Sao lưu dữ liệu</b>
                <p>Tải toàn bộ dữ liệu của trang quản trị này về máy (tệp JSON).</p>
                <button type="button" className="adm-btn" onClick={() => (downloadJSON(`${site.slug}-sao-luu-${isoDay()}.json`, store.exportAll()), toast('Đã tải tệp sao lưu'))}>
                  <Download size={16} /> Tải bản sao lưu
                </button>
              </div>
              <div>
                <b>Khôi phục từ tệp</b>
                <p>Nhập lại tệp sao lưu đã tải trước đó.</p>
                <button type="button" className="adm-btn" onClick={() => fileRef.current.click()}>
                  <Upload size={16} /> Chọn tệp…
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    if (!f) return
                    try {
                      const data = JSON.parse(await f.text())
                      if (typeof data !== 'object' || Array.isArray(data)) throw new Error()
                      if (!(await confirm({ title: 'Khôi phục dữ liệu', text: 'Dữ liệu hiện tại sẽ được thay bằng nội dung trong tệp. Tiếp tục?', danger: true }))) return
                      store.importAll(data)
                      toast('Đã khôi phục dữ liệu')
                    } catch {
                      toast('Tệp không đúng định dạng sao lưu', 'danger')
                    }
                  }}
                />
              </div>
              <div>
                <b>Làm lại từ đầu</b>
                <p>Xoá mọi thay đổi và đưa trang quản trị về dữ liệu mẫu ban đầu.</p>
                <button
                  type="button"
                  className="adm-btn adm-btn--danger"
                  onClick={async () => {
                    if (!(await confirm({ title: 'Khôi phục dữ liệu mẫu', text: 'Toàn bộ thay đổi bạn đã làm trên trang quản trị này sẽ bị xoá. Tiếp tục?', danger: true, ok: 'Khôi phục' }))) return
                    store.reset()
                    toast('Đã khôi phục dữ liệu mẫu')
                  }}
                >
                  <RotateCcw size={16} /> Khôi phục dữ liệu mẫu
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
