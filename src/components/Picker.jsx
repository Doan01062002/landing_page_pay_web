import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'

/*
  Ô chọn tự dựng thay cho <select>: có ảnh nhỏ, nhóm, dòng phụ, đánh dấu mục đang chọn.
  - Bàn phím: ↑ ↓ Home End để di chuyển, Enter / Space để chọn, Esc để đóng.
  - Điện thoại: mở dạng bảng trượt từ dưới lên.
  options: [{ value, label, sub?, meta?, image?, icon?, group? }]
*/
export default function Picker({ value, options, onChange, ariaLabel, title, variant = 'compact', align = 'left', renderButton }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const btnRef = useRef(null)
  const uid = useId()
  const current = options.find((o) => o.value === value) || options[0]

  // Đóng khi bấm ra ngoài
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  // Mở: đưa focus vào danh sách, chọn sẵn mục hiện tại
  useEffect(() => {
    if (!open) return
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    requestAnimationFrame(() => listRef.current?.focus())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Cuộn mục đang trỏ vào vùng nhìn thấy
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) btnRef.current?.focus()
  }
  const pick = (o) => {
    close()
    if (o.value !== value) onChange(o.value)
  }

  const onKey = (e) => {
    const last = options.length - 1
    if (e.key === 'ArrowDown') (e.preventDefault(), setActive((i) => Math.min(last, i + 1)))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setActive((i) => Math.max(0, i - 1)))
    else if (e.key === 'Home') (e.preventDefault(), setActive(0))
    else if (e.key === 'End') (e.preventDefault(), setActive(last))
    else if (e.key === 'Enter' || e.key === ' ') (e.preventDefault(), pick(options[active]))
    else if (e.key === 'Escape') (e.preventDefault(), close())
    else if (e.key === 'Tab') close(false)
  }

  // Gom theo nhóm, giữ thứ tự xuất hiện
  const groups = []
  options.forEach((o, i) => {
    const g = o.group || ''
    let grp = groups.find((x) => x.name === g)
    if (!grp) groups.push((grp = { name: g, items: [] }))
    grp.items.push({ ...o, i })
  })

  return (
    <div className={`picker picker--${variant} picker--${align}` + (open ? ' is-open' : '')} ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className="picker__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${ariaLabel}: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') (e.preventDefault(), setOpen(true))
        }}
      >
        {renderButton ? (
          renderButton(current)
        ) : (
          <>
            {current.icon && <Icon name={current.icon} size={15} />}
            <span className="picker__btn-label">{current.label}</span>
          </>
        )}
        <Icon name="ChevronDown" size={16} className="picker__chev" />
      </button>

      {open && (
        <>
          <div className="picker__backdrop" onClick={() => close()} aria-hidden="true" />
          <div className="picker__panel">
            <div className="picker__head">
              <b>{title || ariaLabel}</b>
              <button type="button" className="picker__close" onClick={() => close()} aria-label="Đóng">
                <Icon name="X" size={18} />
              </button>
            </div>
            <ul
              ref={listRef}
              className="picker__list"
              role="listbox"
              aria-label={ariaLabel}
              tabIndex={-1}
              aria-activedescendant={`${uid}-${active}`}
              onKeyDown={onKey}
            >
              {groups.map((g) => (
                <li key={g.name || 'all'} role="presentation" className="picker__group">
                  {g.name && (
                    <span className="picker__group-name" role="presentation">
                      {g.name}
                    </span>
                  )}
                  <ul role="group" aria-label={g.name || undefined}>
                    {g.items.map((o) => (
                      <li
                        key={o.value}
                        id={`${uid}-${o.i}`}
                        data-i={o.i}
                        role="option"
                        aria-selected={o.value === value}
                        className={'picker__opt' + (o.i === active ? ' is-active' : '') + (o.value === value ? ' is-selected' : '')}
                        onMouseEnter={() => setActive(o.i)}
                        onClick={() => pick(o)}
                      >
                        {o.image ? (
                          <img src={o.image} alt="" className="picker__thumb" loading="lazy" />
                        ) : o.icon ? (
                          <span className="picker__icon">
                            <Icon name={o.icon} size={16} />
                          </span>
                        ) : null}
                        <span className="picker__text">
                          <b>{o.label}</b>
                          {o.sub && <small>{o.sub}</small>}
                        </span>
                        {o.meta && <span className="picker__meta">{o.meta}</span>}
                        <Icon name="Check" size={16} strokeWidth={3} className="picker__check" />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
