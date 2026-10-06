/* Gara Nhật Đức – bản "Ladi": popup ưu đãi, ảnh trượt, đếm ngược, popup video, form đặt lịch. */
const CONFIG = {
  // Điền URL (Google Apps Script, Formspree…) để nhận phiếu đặt lịch; để trống → lưu tạm trong trình duyệt.
  formEndpoint: '',
  popupDelay: 4000, // ms sau khi vào trang mới hiện popup ưu đãi (1 lần mỗi phiên)
}

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const store = {
  get: (k) => { try { return sessionStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { sessionStorage.setItem(k, v) } catch { /* bị chặn lưu trữ */ } },
}

/* ---------- Tháng, năm hiện tại ---------- */
const now = new Date()
$$('[data-month]').forEach((el) => (el.textContent = now.getMonth() + 1))
$$('[data-year]').forEach((el) => (el.textContent = now.getFullYear()))

/* ---------- Menu điện thoại ---------- */
const nav = $('#nav')
const burger = $('#burger')
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open')
  burger.setAttribute('aria-expanded', open)
})
$$('#nav a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false') }))

/* ---------- Hiện dần khi cuộn + số đếm ---------- */
const countUp = (el) => {
  const end = +el.dataset.count
  const dec = +(el.dataset.decimals || 0)
  const t0 = performance.now()
  const step = (t) => {
    const p = Math.min(1, (t - t0) / 1400)
    el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec).replace('.', ',')
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return
    e.target.classList.add('is-in')
    $$('[data-count]', e.target).forEach(countUp)
    io.unobserve(e.target)
  })
}, { rootMargin: '0px 0px -8% 0px' })
$$('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`
  io.observe(el)
})

/* ---------- Ảnh trượt có hàng ảnh nhỏ ---------- */
$$('[data-slider]').forEach((slider) => {
  const imgs = $$('.slider__view img', slider)
  const thumbs = $('.slider__thumbs', slider)
  let i = 0
  let timer
  imgs.forEach((img, k) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.setAttribute('aria-label', `Xem ảnh ${k + 1}: ${img.alt}`)
    b.innerHTML = `<img src="${img.getAttribute('src')}" alt="" loading="lazy">`
    b.addEventListener('click', () => show(k))
    thumbs.appendChild(b)
  })
  const show = (k) => {
    i = (k + imgs.length) % imgs.length
    imgs.forEach((im, n) => im.classList.toggle('is-on', n === i))
    $$('button', thumbs).forEach((b, n) => b.classList.toggle('is-on', n === i))
    clearInterval(timer)
    timer = setInterval(() => show(i + 1), 4500)
  }
  $('.slider__nav--prev', slider).addEventListener('click', () => show(i - 1))
  $('.slider__nav--next', slider).addEventListener('click', () => show(i + 1))
  show(0)
})

/* ---------- Đếm ngược tới hết tháng (ưu đãi tháng) ---------- */
const countdown = $('[data-countdown]')
if (countdown) {
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const cells = $$('span', countdown)
  const pad = (n) => String(n).padStart(2, '0')
  const tick = () => {
    let s = Math.max(0, Math.floor((end - Date.now()) / 1000))
    const d = Math.floor(s / 86400); s -= d * 86400
    const h = Math.floor(s / 3600); s -= h * 3600
    const m = Math.floor(s / 60); s -= m * 60
    ;[d, h, m, s].forEach((v, k) => (cells[k].textContent = pad(v)))
  }
  tick()
  setInterval(tick, 1000)
}

/* ---------- Mở / đóng popup ---------- */
let lastFocus = null
const openModal = (el) => {
  lastFocus = document.activeElement
  el.hidden = false
  document.documentElement.style.overflow = 'hidden'
  ;($('input, button[data-close]', el) || el).focus({ preventScroll: true })
}
const closeModal = (el) => {
  if (el.hidden) return
  el.hidden = true
  if (el.id === 'vmodal') $('.vmodal__frame', el).innerHTML = '' // dừng video
  if (!$$('.pop:not([hidden]), .vmodal:not([hidden])').length) document.documentElement.style.overflow = ''
  lastFocus?.focus?.({ preventScroll: true })
}
$$('.pop, .vmodal').forEach((m) => {
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) closeModal(m)
  })
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $$('.pop:not([hidden]), .vmodal:not([hidden])').forEach(closeModal)
})

/* Popup ưu đãi: hiện 1 lần mỗi phiên */
const pop = $('#pop')
if (store.get('nd_pop') !== '1') {
  setTimeout(() => {
    if ($$('.pop:not([hidden]), .vmodal:not([hidden])').length) return
    openModal(pop)
    store.set('nd_pop', '1')
  }, CONFIG.popupDelay)
}

/* ---------- Video TikTok / YouTube trong popup ---------- */
// Nhận link TikTok (…/video/<số>) hoặc YouTube (watch?v=, youtu.be/, shorts/).
const parseVideo = (url) => {
  url = (url || '').trim()
  let m = url.match(/tiktok\.com\/.*\/video\/(\d+)/)
  if (m) return { kind: 'tiktok', src: `https://www.tiktok.com/player/v1/${m[1]}?autoplay=1&rel=0&description=1&music_info=0` }
  m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (m) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&playsinline=1` }
  return null
}
const vmodal = $('#vmodal')
$$('[data-video]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const v = parseVideo(btn.dataset.video)
    if (!v) return
    $('.vmodal__box', vmodal).classList.toggle('is-tiktok', v.kind === 'tiktok')
    $('.vmodal__frame', vmodal).innerHTML = `<iframe src="${v.src}" title="${btn.dataset.title || 'Video Gara Nhật Đức'}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
    openModal(vmodal)
  })
})

/* ---------- Nút "Đặt lịch" ở thẻ dịch vụ / giá → chọn sẵn dịch vụ trong form ---------- */
const bookForm = $('#bookForm')
$$('[data-service]').forEach((a) => {
  a.addEventListener('click', () => {
    const name = a.dataset.service
    const sel = bookForm.elements.service
    if (name && [...sel.options].some((o) => o.text === name)) sel.value = name
    setTimeout(() => bookForm.elements.name.focus({ preventScroll: true }), 700)
  })
})

/* ---------- Form đặt lịch ---------- */
// Số di động Việt Nam: 10 số, đầu 03/05/07/08/09; chấp nhận +84 / 84, dấu cách, chấm, gạch.
const normalizePhone = (s) => {
  s = String(s || '').replace(/[\s.\-()]/g, '')
  if (s.startsWith('+84')) s = '0' + s.slice(3)
  else if (/^84\d{9}$/.test(s)) s = '0' + s.slice(2)
  return /^0[35789]\d{8}$/.test(s) ? s : null
}
const okModal = $('#okModal')

const handleForm = (form, onDone) => {
  const field = (n) => form.elements[n]
  const check = () => {
    const nameOk = field('name').value.trim().length >= 2
    const phoneOk = !!normalizePhone(field('phone').value)
    field('name').closest('.field').classList.toggle('has-err', !nameOk)
    field('phone').closest('.field').classList.toggle('has-err', !phoneOk)
    if (!nameOk) field('name').focus()
    else if (!phoneOk) field('phone').focus()
    return nameOk && phoneOk
  }
  ;['name', 'phone'].forEach((n) => field(n).addEventListener('input', () => field(n).closest('.field').classList.remove('has-err')))

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (field('website').value) return // bẫy bot
    if (!check()) return
    const data = {
      name: field('name').value.trim(),
      phone: normalizePhone(field('phone').value),
      service: field('service')?.value || 'Chưa chọn',
      note: field('note')?.value.trim() || '',
      source: location.href,
      createdAt: new Date().toISOString(),
    }
    const btn = $('button[type="submit"]', form)
    btn.disabled = true
    try {
      if (CONFIG.formEndpoint) {
        await fetch(CONFIG.formEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
      } else {
        try {
          const list = JSON.parse(localStorage.getItem('cc_bookings') || '[]')
          list.push(data)
          localStorage.setItem('cc_bookings', JSON.stringify(list))
        } catch { /* trình duyệt chặn lưu trữ – bỏ qua */ }
        await new Promise((r) => setTimeout(r, 500))
      }
      window.dataLayer?.push({ event: 'booking_submit', service: data.service })
      form.reset()
      onDone?.()
      $('[data-out="name"]', okModal).textContent = data.name
      $('[data-out="phone"]', okModal).textContent = data.phone
      openModal(okModal)
    } catch {
      alert('Gửi chưa thành công, vui lòng gọi 08 3695 3695 để đặt lịch ngay.')
    } finally {
      btn.disabled = false
    }
  })
}
handleForm(bookForm)
handleForm($('#popForm'), () => closeModal(pop))
