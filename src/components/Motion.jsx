import { useEffect, useRef, useState } from 'react'

// Có chạy hiệu ứng không: tắt khi trang mẫu đang hiển thị thu nhỏ (embed=1).
// Khi người dùng bật "giảm chuyển động", CSS tự đổi sang dạng mờ dần nhẹ (cuối motion.css).
export function motionAllowed() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('embed') !== '1'
}

// Người dùng bật "giảm chuyển động" trong hệ điều hành.
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/*
  Gọi cb một lần khi phần tử lọt vào khung nhìn (hoặc đã bị cuộn qua).
  Dùng IntersectionObserver, kèm kiểm tra theo sự kiện cuộn làm dự phòng
  để nội dung không bao giờ bị kẹt ở trạng thái ẩn.
*/
const watchers = new Set()
let listening = false
let pending = null
function checkWatchers() {
  pending = null
  const vh = window.innerHeight
  watchers.forEach((w) => {
    if (!w.el.isConnected) return watchers.delete(w)
    // Không đo được khung nhìn (khung bị ẩn, trình duyệt lạ): hiện luôn, không để nội dung bị ẩn.
    if (!vh) return w.fire()
    const r = w.el.getBoundingClientRect()
    if ((r.top < vh * w.ratio && r.bottom > 0) || r.bottom <= 0) w.fire()
  })
}
function scheduleCheck() {
  if (!pending) pending = setTimeout(checkWatchers, 60)
}
export function whenVisible(el, cb, { threshold = 0.12, ratio = 0.94 } = {}) {
  let done = false
  const io = new IntersectionObserver(([e]) => e.isIntersecting && w.fire(), { threshold, rootMargin: '0px 0px -6% 0px' })
  const w = {
    el,
    ratio,
    fire() {
      if (done) return
      done = true
      watchers.delete(w)
      io.disconnect()
      cb()
    },
  }
  watchers.add(w)
  io.observe(el)
  if (!listening) {
    listening = true
    window.addEventListener('scroll', scheduleCheck, { passive: true })
    window.addEventListener('resize', scheduleCheck)
  }
  scheduleCheck()
  return () => {
    done = true
    watchers.delete(w)
    io.disconnect()
  }
}

/*
  Hiện dần phần tử khi cuộn tới.
  - data-reveal="up|down|left|right|zoom|fade" trên một phần tử
  - data-stagger="up|…" trên phần tử cha: các con hiện lần lượt
  Khi chưa có lớp .motion trên <html> (không JS, ảnh thu nhỏ) mọi thứ luôn hiển thị.
*/
export function RevealManager() {
  useEffect(() => {
    if (!motionAllowed()) return
    const root = document.documentElement
    root.classList.add('motion')
    const stops = []

    const reveal = (el) => {
      el.classList.add('is-in')
      const delay = parseFloat(el.style.getPropertyValue('--d')) || 0
      // Sau khi hiện xong, bỏ trạng thái reveal để hover/transition riêng của phần tử hoạt động bình thường.
      setTimeout(() => {
        el.removeAttribute('data-reveal')
        el.setAttribute('data-revealed', '')
      }, 950 + delay * 90)
    }

    let queued = null
    const scan = () => {
      queued = null
      document.querySelectorAll('[data-stagger]').forEach((parent) => {
        ;[...parent.children].forEach((child, i) => {
          if (child.hasAttribute('data-reveal') || child.hasAttribute('data-revealed')) return
          child.setAttribute('data-reveal', parent.dataset.stagger || 'up')
          child.style.setProperty('--d', String(i % 8))
        })
      })
      document.querySelectorAll('[data-reveal]:not([data-obs])').forEach((el) => {
        el.setAttribute('data-obs', '')
        const stop = whenVisible(el, () => reveal(el))
        stops.push(() => {
          stop()
          // Cho phép theo dõi lại nếu hiệu ứng được gắn lại (StrictMode, hot reload).
          if (!el.classList.contains('is-in')) el.removeAttribute('data-obs')
        })
      })
    }
    const queue = () => {
      if (!queued) queued = setTimeout(scan, 16)
    }
    scan()
    const mo = new MutationObserver(queue)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      stops.forEach((stop) => stop())
      root.classList.remove('motion')
    }
  }, [])
  return null
}

/* true khi phần tử đã xuất hiện trong khung nhìn (chỉ đổi một lần). */
export function useInView(options = { threshold: 0.3 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return whenVisible(el, () => setInView(true), { threshold: options.threshold, ratio: 0.9 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [ref, inView]
}

/*
  Số chạy từ 0 tới giá trị khi cuộn tới. Giữ nguyên tiền tố / hậu tố:
  "1.200+" → đếm tới 1200 rồi hiện "1.200+", "4,9★" → đếm thập phân.
*/
export function CountUp({ value, duration = 1400 }) {
  const str = String(value)
  const m = str.match(/^([^\d]*)(\d[\d.,]*)(.*)$/)
  const [ref, inView] = useInView({ threshold: 0.4 })
  const [shown, setShown] = useState(() => (m && motionAllowed() ? null : str))

  useEffect(() => {
    if (!m || !inView || shown === str) return
    const [, pre, num, post] = m
    const isDecimal = num.includes(',')
    const target = isDecimal ? parseFloat(num.replace(',', '.')) : parseInt(num.replace(/\./g, ''), 10)
    const decimals = isDecimal ? num.split(',')[1].length : 0
    const fmt = (n) => (isDecimal ? n.toFixed(decimals).replace('.', ',') : Math.round(n).toLocaleString('vi-VN'))
    let id
    const t0 = Date.now()
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(pre + fmt(target * eased) + post)
      if (p < 1) id = setTimeout(tick, 16)
      else setShown(str)
    }
    tick()
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  // Trước khi chạy, hiện số 0 với cùng định dạng để bố cục không nhảy.
  const placeholder = m ? m[1] + (m[2].includes(',') ? '0,' + '0'.repeat(m[2].split(',')[1].length) : '0') + m[3] : str
  return (
    <span ref={ref} className="countup" aria-label={str}>
      {shown ?? placeholder}
    </span>
  )
}

/* Thanh tiến trình cuộn trang mỏng ở mép trên. */
export function ScrollProgress() {
  const ref = useRef(null)
  useEffect(() => {
    let raf
    const update = () => {
      raf = null
      const h = document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? window.scrollY / h : 0
      if (ref.current) ref.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <div className="scroll-progress" ref={ref} aria-hidden="true" />
}

/* true khi trang đã cuộn quá `offset` px. */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

/* Lặp chỉ số 0..n-1 sau mỗi `ms` (ví dụ: đổi chữ, đổi thông báo). Tắt ở ảnh thu nhỏ. */
export function useCycle(n, ms) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!motionAllowed()) return
    const id = setInterval(() => setI((x) => (x + 1) % n), ms)
    return () => clearInterval(id)
  }, [n, ms])
  return i
}
