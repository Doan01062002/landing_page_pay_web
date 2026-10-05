import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import ConsultForm from './ConsultForm.jsx'
import { site, formatVND } from '../data/site.js'

export default function ConsultModal({ template, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector('input')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby="consult-title" ref={ref}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Đóng">
          <Icon name="X" size={20} />
        </button>
        <div className="modal__head">
          <p className="eyebrow">{template ? `Bạn đã chọn mẫu ${template}` : 'Nhận tư vấn miễn phí'}</p>
          <h2 id="consult-title">Để lại số điện thoại, chúng tôi gọi lại trong 30 phút</h2>
          <div className="modal__gift">
            <Icon name="Gift" size={18} />
            <span>
              Tặng kèm landing page quảng cáo trị giá <strong>{formatVND(site.promo.giftValue)}</strong>
            </span>
          </div>
        </div>
        <ConsultForm defaultTemplate={template} idPrefix="modal" compact />
      </div>
    </div>
  )
}
