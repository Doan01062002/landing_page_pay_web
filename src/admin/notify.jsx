// Thông báo việc cần xử lý: mỗi việc có mã riêng theo đúng sự việc (vd "leads:12:new", "orders:5:due:2026-10-15"),
// trạng thái "đã xem" lưu theo mã → đã xem thì không báo lại; sự việc đổi (hẹn gọi lại ngày khác…) thành thông báo mới.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { ago } from './lib.js'

// Tập mã đã xem. load(): mảng mã (có thể bất đồng bộ); save(keys): lưu các mã mới xem
export function useSeen(load, save) {
  const [seen, setSeen] = useState(() => new Set())
  const ref = useRef(seen)
  useEffect(() => {
    let alive = true
    Promise.resolve()
      .then(load)
      .then((keys) => {
        if (!alive || !keys?.length) return
        ref.current = new Set([...ref.current, ...keys])
        setSeen(ref.current)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [load])
  const mark = useCallback(
    (keys) => {
      const fresh = [].concat(keys).filter((k) => k && !ref.current.has(k))
      if (!fresh.length) return
      ref.current = new Set([...ref.current, ...fresh])
      setSeen(ref.current)
      Promise.resolve()
        .then(() => save(fresh))
        .catch(() => {})
    },
    [save],
  )
  return [seen, mark]
}

// Lưu trên trình duyệt (trang quản trị demo, chưa có máy chủ): giữ tối đa 2000 mã gần nhất
export function localSeen(storageKey) {
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch {
      return []
    }
  }
  return {
    load: read,
    save: (keys) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...new Set([...read(), ...keys])].slice(-2000)))
      } catch {
        /* trình duyệt chặn lưu trữ */
      }
    },
  }
}

// số việc chưa xem theo từng chức năng (huy hiệu thanh bên)
export function unseenByModule(items, seen) {
  const out = {}
  for (const i of items) if (!seen.has(i.key)) out[i.module] = (out[i.module] || 0) + 1
  return out
}

// Chuông + danh sách thông báo. items: [{ key, module, title, sub, time, path }]
export function NotifyBell({ items, seen, mark, go, open, onToggle }) {
  const unseen = items.filter((i) => !seen.has(i.key))
  const list = [...items].sort((a, b) => seen.has(a.key) - seen.has(b.key) || String(b.time || '').localeCompare(String(a.time || ''))).slice(0, 40)
  return (
    <div className="adm-top__pop">
      <button type="button" className="adm-iconbtn" onClick={onToggle} aria-label={`Thông báo (${unseen.length} chưa xem)`} aria-expanded={open}>
        <Bell size={19} />
        {unseen.length > 0 && <i className="adm-dot">{unseen.length > 99 ? '99+' : unseen.length}</i>}
      </button>
      {open && (
        <div className="adm-pop adm-pop--right adm-notify">
          <div className="adm-notify__head">
            <b>
              Thông báo {unseen.length > 0 && <span className="adm-notify__count">{unseen.length} mới</span>}
            </b>
            {unseen.length > 0 && (
              <button type="button" className="adm-notify__all" onClick={() => mark(unseen.map((i) => i.key))}>
                <CheckCheck size={16} /> Đánh dấu tất cả đã xem
              </button>
            )}
          </div>
          {list.length ? (
            <ul className="adm-notify__list">
              {list.map((i) => (
                <li key={i.key}>
                  <button
                    type="button"
                    className={seen.has(i.key) ? '' : 'is-new'}
                    onClick={() => {
                      mark(i.key)
                      go(i.path)
                    }}
                  >
                    <span className="adm-notify__dot" aria-label={seen.has(i.key) ? 'Đã xem' : 'Chưa xem'} />
                    <span className="adm-notify__text">
                      <b>{i.title}</b>
                      {i.sub && <small>{i.sub}</small>}
                    </span>
                    {i.time && <time>{ago(i.time)}</time>}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-muted">Không có việc cần xử lý</p>
          )}
        </div>
      )}
    </div>
  )
}
