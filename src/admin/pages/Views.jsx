// Hai kiểu xem phụ cho trang danh sách: lịch tuần (lịch hẹn, lắp đặt, lái thử) và bảng kéo thả theo giai đoạn (khách quan tâm).
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { addDays, fmtDate, isoDay, WEEKDAYS } from '../lib.js'
import { toneOf } from '../ui.jsx'

const monday = (d) => {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

export function CalendarView({ rows, cfg, onOpen, onNew }) {
  const [start, setStart] = useState(() => monday(new Date()))
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const today = isoDay()
  const byDay = {}
  rows.forEach((r) => (byDay[r[cfg.date]] ||= []).push(r))
  const end = days[6]
  const total = days.reduce((s, d) => s + (byDay[isoDay(d)]?.length || 0), 0)
  return (
    <div className="adm-cal">
      <div className="adm-cal__nav">
        <button type="button" className="adm-iconbtn" onClick={() => setStart(addDays(start, -7))} aria-label="Tuần trước">
          <ChevronLeft size={18} />
        </button>
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => setStart(monday(new Date()))}>
          Tuần này
        </button>
        <button type="button" className="adm-iconbtn" onClick={() => setStart(addDays(start, 7))} aria-label="Tuần sau">
          <ChevronRight size={18} />
        </button>
        <b>
          {fmtDate(isoDay(start))} – {fmtDate(isoDay(end))}
        </b>
        <span className="adm-muted">{total} lịch</span>
      </div>
      <div className="adm-cal__grid">
        {days.map((d) => {
          const key = isoDay(d)
          const list = (byDay[key] || []).sort((a, b) => String(a[cfg.time]).localeCompare(String(b[cfg.time])))
          return (
            <div key={key} className={`adm-cal__day ${key === today ? 'is-today' : ''} ${key < today ? 'is-past' : ''}`}>
              <div className="adm-cal__head">
                <span>{WEEKDAYS[d.getDay()]}</span>
                <b>{d.getDate()}</b>
                <em>{list.length || ''}</em>
                <button type="button" className="adm-cal__add" onClick={() => onNew(key, '09:00')} aria-label={`Thêm lịch ngày ${fmtDate(key)}`}>
                  <Plus size={14} />
                </button>
              </div>
              <div className="adm-cal__list">
                {list.map((r) => (
                  <button key={r.id} type="button" className={`adm-cal__ev adm-cal__ev--${toneOf(r.status)}`} onClick={() => onOpen(r)}>
                    <time>{r[cfg.time]}</time>
                    <b>{cfg.title(r)}</b>
                    <span>{cfg.sub(r)}</span>
                  </button>
                ))}
                {!list.length && <p className="adm-cal__none">Trống</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function BoardView({ rows, statuses, cfg, onOpen, onMove }) {
  const [over, setOver] = useState(null)
  const byStatus = Object.fromEntries(statuses.map((s) => [s, []]))
  rows.forEach((r) => byStatus[r.status]?.push(r))
  return (
    <div className="adm-board">
      {statuses.map((s) => (
        <section
          key={s}
          className={`adm-board__col adm-board__col--${toneOf(s)} ${over === s ? 'is-over' : ''}`}
          onDragOver={(e) => (e.preventDefault(), setOver(s))}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(null)
            const r = rows.find((x) => x.id === e.dataTransfer.getData('text/plain'))
            if (r && r.status !== s) onMove(r, s)
          }}
        >
          <header>
            <b>{s}</b>
            <span>{byStatus[s].length}</span>
          </header>
          <div className="adm-board__list">
            {byStatus[s].slice(0, 40).map((r) => (
              <article key={r.id} className="adm-board__card" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', r.id)} onClick={(e) => !e.target.closest('select') && onOpen(r)}>
                <b>{cfg.title(r)}</b>
                <span>{cfg.sub(r)}</span>
                <em>{cfg.meta(r)}</em>
                {/* điện thoại không kéo thả được: chọn giai đoạn */}
                <select value={r.status} onChange={(e) => onMove(r, e.target.value)} aria-label="Chuyển giai đoạn">
                  {statuses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </article>
            ))}
            {byStatus[s].length > 40 && <p className="adm-muted">+{byStatus[s].length - 40} khác (lọc để xem)</p>}
          </div>
        </section>
      ))}
    </div>
  )
}

