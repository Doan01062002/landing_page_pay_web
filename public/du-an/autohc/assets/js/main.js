/* AUTO HC 579 – landing page (không có backend: form đặt lịch chỉ hiện thông báo, không gửi đi đâu) */
;(() => {
  'use strict'

  // ================= DỮ LIỆU =================
  const C = {
    address: '579 Đường Phúc Diễn - P. Xuân Phương - Q. Nam Từ Liêm - Hà Nội',
    tel: '0979427059',
    hotline: '0979.427.059',
    hotlineDots: '0979.42.70.59',
    tel2: '0977508804',
    hotline2: '0977.50.88.04',
    zaloDots: '0374.57.94.70',
    email: 'autohc579hn@gmail.com',
    zalo: 'https://zalo.me/0979427059',
    fb: 'https://www.facebook.com/garaotoHC579',
    msg: 'https://www.messenger.com/t/garaotoHC579',
    map: 'https://www.google.com/maps?ll=21.029316,105.757062&z=15&t=m&cid=12505715833210545677',
    embed: 'https://maps.google.com/maps?q=21.029316,105.757062&z=16&hl=vi&output=embed',
  }
  const now = new Date()
  C.dealMonth = `THÁNG ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

  const IMG = 'assets/img/'
  // Dịch vụ trong form đặt lịch (thẻ bấm vào sẽ chọn sẵn mục tương ứng)
  const bookServices = ['Bảo dưỡng định kỳ', 'Sửa chữa máy gầm', 'Sửa chữa điện, điều hoà', 'Sơn gò, sơn dặm', 'Chăm sóc, rửa xe, dọn nội thất', 'Má phanh, giảm xóc', 'Dán phim cách nhiệt', 'Độ xe, lắp phụ kiện', 'Cứu hộ ô tô', 'Khác']

  // Ưu đãi tháng (2 sản phẩm cạnh banner)
  const deals = [
    { name: 'Bóng đèn LED ô tô siêu sáng LX LED HEADLIGHT - Bảo hành 3 năm', img: 'p-led.svg', price: 1500000, old: 1850000 },
    { name: 'Camera hành trình kẹp gương Q15 kết nối điện thoại dây 15M', img: 'p-cam-q15.webp', price: 2380000, old: 2890000 },
  ].map((p) => ({ ...p, img: IMG + p.img, service: 'Độ xe, lắp phụ kiện' }))

  // Bảng giá dịch vụ
  const prices = [
    ['Thay dầu, lọc dầu động cơ', 'g-thay-dau.webp', 450000, 'Bảo dưỡng định kỳ'],
    ['Vệ sinh khoang máy ô tô', 'g-khoang-may.webp', 350000, 'Chăm sóc, rửa xe, dọn nội thất'],
    ['Sơn dặm 1 mặt (cửa, ba đờ sốc...)', 'g-son-dam.webp', 1200000, 'Sơn gò, sơn dặm'],
    ['Đánh bóng, phục hồi sơn toàn xe', 'g-danh-bong.webp', 1500000, 'Chăm sóc, rửa xe, dọn nội thất'],
    ['Rửa xe bọt tuyết, hút bụi', 'g-rua-xe.webp', 120000, 'Chăm sóc, rửa xe, dọn nội thất'],
    ['Dọn nội thất, khử mùi', 'g-noi-that.webp', 900000, 'Chăm sóc, rửa xe, dọn nội thất'],
    ['Cân bằng động 4 bánh', 'g-can-bang.webp', 200000, 'Sửa chữa máy gầm'],
    ['Kiểm tra gầm, máy tổng quát', 'g-gam.webp', 0, 'Sửa chữa máy gầm'],
  ].map(([name, img, price, service]) => ({ name, img: IMG + img, price, service }))

  const services = [
    ['SỬA CHỮA MÁY GẦM', 's-may-gam.webp', 'Chuyên sửa chữa đại tu động cơ, đại tu thước lái, sửa chữa turbo, sửa chữa gầm...', 'Sửa chữa máy gầm'],
    ['SƠN XE Ô TÔ', 's-son.webp', 'Chuyên sơn gò ô tô: Sơn dặm, sơn quây, sơn đổi màu ô tô, phục hồi xe tai nạn...', 'Sơn gò, sơn dặm'],
    ['BẢO DƯỠNG ĐỊNH KỲ', 's-bao-duong.webp', 'Bảo dưỡng ô tô các cấp: Thay dầu, bảo dưỡng định kỳ xe ô tô', 'Bảo dưỡng định kỳ'],
    ['SỬA ĐIỀU HÒA Ô TÔ', 's-dieu-hoa.webp', 'Sửa điều hòa ô tô chuyên sâu: Thay lốc, thay giàn nóng, giàn lạnh...', 'Sửa chữa điện, điều hoà'],
    ['CỨU HỘ Ô TÔ', 's-cuu-ho.webp', 'Cứu hộ xe ô tô 24/7 - Sửa chữa ô tô lưu động - Sửa chữa xe ô tô tại nhà...', 'Cứu hộ ô tô'],
    ['PHIM CÁCH NHIỆT 3M', 's-phim.webp', 'Đại lý dán phim cách nhiệt 3M - Chiết khấu cao - Bảo hành dài lâu', 'Dán phim cách nhiệt'],
    ['PHỤ TÙNG Ô TÔ', 's-phu-tung.webp', 'Cung cấp phụ tùng chính hãng các dòng xe Toyota, Kia, Huyndai, Mazda, Ford...', 'Khác'],
    ['ĐỘ XE - ĐỒ CHƠI XE', 's-do-xe.webp', 'Độ đèn, gương, camera hành trình, cam 360, độ body, nâng đời xe ô tô...', 'Độ xe, lắp phụ kiện'],
    ['SƠN LAZANG Ô TÔ', 's-lazang.webp', 'Chuyên sơn lazang, phay mâm xe ô tô, phục hồi lazang móp, vênh...', 'Sơn gò, sơn dặm'],
    ['PHỤC CHẾ GƯƠNG ĐÈN', 's-guong-den.webp', 'Chuyên phục chế gương đèn ô tô vỡ, gẫy, vá đèn, thay mặt đèn, đánh bóng đèn...', 'Độ xe, lắp phụ kiện'],
  ].map(([t, img, d, service]) => ({ t, img: IMG + img, d, service }))

  const posts = [
    ['Căn chỉnh, cân bằng lốp ô tô: vì sao? khi nào? chi phí bao nhiêu?', 'b-lop.webp', '24/09/2026', 'Lốp mòn lệch, vô lăng rung ở tốc độ cao là lúc xe cần cân bằng động và căn chỉnh góc đặt bánh. Nên kiểm tra mỗi 10.000 km.'],
    ['Cần bảo dưỡng xe ô tô ít được sử dụng như thế nào?', 'b-it-di.webp', '22/09/2026', 'Xe ít chạy vẫn cần thay dầu theo thời gian 6–12 tháng, nổ máy hằng tuần, giữ ắc quy đầy và bơm lốp đúng áp suất.'],
    ['7 yếu tố cần xem xét trước khi chọn gara sửa ô tô gần nhất tại Hà Nội', 'b-chon-gara.webp', '12/09/2026', 'Ưu tiên gara báo giá rõ trước khi sửa, phụ tùng có nguồn gốc, bảo hành bằng văn bản và xưởng đủ cầu nâng, phòng sơn.'],
  ].map(([t, img, date, ex]) => ({ t, img: IMG + img, date, ex }))

  const HL = '- Hotline : 0979.42.70.59'
  const videos = [
    ['Hướng dẫn về rửa khoang máy ô tô, vệ sinh khoang động cơ ô tô', 'v-khoang-may.webp', 'assets/video/khoang-may.mp4'],
    ['Video giới thiệu dịch vụ Garage Auto HC 579 ', 'v-gioi-thieu.webp', 'assets/video/gioi-thieu.mp4'],
    ['Quy trình sơn xe dặm xe ô tô màu trắng ngọc trai xe Huyndai Elantra ', 'v-son-dam.webp', 'assets/video/son-dam.mp4'],
  ].map(([t, img, src]) => ({ t: t + HL, img: IMG + img, src }))

  const feedback = [
    ['VŨ THU HUYỀN', 'Giáo viên', 'Dịch vụ xuất sắc. Chồng tôi sửa chữa và sơn xe ô tô Toyota Fortuner không vấn đề gì, không rắc rối. Và tôi đã bảo dưỡng ô tô Huyndai Accent của tôi, một lần nữa không có vấn đề gì. Chi phí rất hợp lý', '#e57373,#c2185b'],
    ['VŨ VIỆT HƯNG', 'Kỹ sư', 'Tôi rất ưng dịch vụ tại Auto HC, giá cả rất tốt và phù hợp. Tôi đã sơn xe ô tô tại tại đây rất đẹp và giá cả hợp lý. Nhân viên tại đây rất nhiệt tình, ân cần và chu đáo.', '#4fc3f7,#1565c0'],
    ['TỐNG NGỌC ÁNH', 'Doanh nhân', 'Tôi đã tiết kiệm được nhiều chi phí khi sử dụng dịch vụ tại Auto HC. Tôi đã sửa chữa đèn, độ đèn xe ô tô của tôi tại đây. Các em kỹ thuật nhiệt tình, tay nghề cao mà giá lại rẻ. Sẽ ủng hộ dài dài.', '#ffb74d,#ef6c00'],
  ]
  const footerSvc = ['Bảo dưỡng ô tô', 'Sơn gò ô tô', 'Sơn lazang ô tô', 'Sửa điều hòa ô tô', 'Sơn dặm ô tô', 'Đại tu gầm ô tô', 'Đại tu động cơ', 'Sửa chữa điện ô tô']

  // ================= TIỆN ÍCH =================
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const vnd = (n) => n.toLocaleString('vi-VN') + '₫'
  const icon = (id, cls = '') => `<svg class="${cls}"><use href="#${id}"/></svg>`
  const normPhone = (v) => v.replace(/[\s.\-()]/g, '').replace(/^\+84/, '0')
  const validPhone = (v) => /^0(3|5|7|8|9)\d{8}$/.test(normPhone(v))

  let logoN = 0
  const logo = () => {
    const g = 'lg' + ++logoN
    return `<svg class="logo-svg" viewBox="0 0 340 150" role="img" aria-label="AUTO HC 579">
      <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd54a"/><stop offset="1" stop-color="#f7941d"/></linearGradient></defs>
      <path d="M14 86C64 52 128 30 200 25c52-4 98 6 132 28-30-11-70-15-114-14C150 41 82 60 14 86z" fill="#1976d2"/>
      <path d="M58 90c50-21 112-32 182-32 24 0 46 3 62 7-22-1-46-1-70 1-62 4-118 12-174 24z" fill="#0d47a1"/>
      <text x="226" y="64" font-size="38" font-weight="900" font-style="italic" fill="url(#${g})" stroke="#0b2a6b" stroke-width="1.8" paint-order="stroke">579</text>
      <text x="4" y="122" font-size="64" font-weight="900" font-style="italic" fill="#0d47a1" textLength="206" lengthAdjust="spacingAndGlyphs">AUTO</text>
      <text x="214" y="122" font-size="64" font-weight="900" font-style="italic" fill="url(#${g})" stroke="#0b2a6b" stroke-width="1.4" paint-order="stroke" textLength="118" lengthAdjust="spacingAndGlyphs">HC</text>
      <text x="172" y="143" text-anchor="middle" font-size="13" font-weight="900" fill="#1b1b1b" textLength="262" lengthAdjust="spacingAndGlyphs">CHĂM SÓC SỬA CHỮA XE ĐÚNG NGHĨA</text>
    </svg>`
  }

  // ================= GẮN DỮ LIỆU =================
  $$('[data-bind]').forEach((el) => (el.textContent = C[el.dataset.bind] ?? ''))
  $$('[data-logo]').forEach((el) => (el.innerHTML = logo()))
  $$('[data-tel]').forEach((a) => (a.href = 'tel:' + C.tel))
  $$('[data-tel2]').forEach((a) => (a.href = 'tel:' + C.tel2))
  $$('[data-mail]').forEach((a) => (a.href = 'mailto:' + C.email))
  $$('[data-zalo]').forEach((a) => (a.href = C.zalo))
  $$('[data-fb]').forEach((a) => (a.href = C.fb))
  $$('[data-msg]').forEach((a) => (a.href = C.msg))
  $$('[data-map]').forEach((a) => (a.href = C.map))
  const select = $('[data-service-select]')
  select.innerHTML = bookServices.map((s) => `<option>${s}</option>`).join('')
  $('[data-footer="svc"]').innerHTML = footerSvc.map((s) => `<li><a href="#dich-vu">${s}</a></li>`).join('')

  // ================= THẺ =================
  const card = (p) => {
    const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0
    const price = p.old
      ? `<b>${vnd(p.price)}</b><s>${vnd(p.old)}</s>`
      : `<span class="contact">${p.price ? 'Từ ' + vnd(p.price) : 'Miễn phí'}</span>`
    return `<article class="pcard reveal" data-book="${esc(p.service)}" data-note="${esc(p.name)}" tabindex="0" aria-label="${esc(p.name)} – đặt lịch">
      <div class="pcard__img"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy">${off ? `<span class="pcard__badge"><span>- ${off}%</span></span>` : ''}</div>
      <div class="pcard__body"><h3 class="pcard__name">${esc(p.name)}</h3><div class="pcard__price">${price}</div><span class="pcard__btn">${icon('i-calendar')} Đặt lịch</span></div>
    </article>`
  }
  $('[data-products="deal"]').innerHTML = deals.map(card).join('')
  $('[data-products="price"]').innerHTML = prices.map(card).join('')

  $('[data-services]').innerHTML = services
    .map((s) => `<article class="scard" data-book="${esc(s.service)}" data-note="${esc(s.t.charAt(0) + s.t.slice(1).toLowerCase())}" tabindex="0"><div class="scard__img"><img src="${s.img}" alt="${esc(s.t)}" loading="lazy"></div><h3>${s.t}</h3><p>${s.d}</p></article>`)
    .join('')

  $('[data-posts]').innerHTML = posts
    .map((p) => `<article class="post reveal"><div class="post__img"><img src="${p.img}" alt="${esc(p.t)}" loading="lazy"></div><h3>${esc(p.t)}</h3><p class="post__date">${icon('i-clock')} Ngày ${p.date}</p><p class="post__ex">${esc(p.ex)}</p></article>`)
    .join('')

  $('[data-videos]').innerHTML = videos
    .map((v, i) => `<article class="vcard reveal" data-video="${i}" tabindex="0"><div class="vcard__img"><img src="${v.img}" alt="" loading="lazy"><span class="vcard__play">${icon('i-play')}</span></div><h3>${esc(v.t)}</h3></article>`)
    .join('')

  $('[data-feedback]').innerHTML = feedback
    .map(([n, r, q, g]) => {
      const ini = n.split(' ').slice(-2).map((w) => w[0]).join('')
      return `<article class="fcard reveal"><div class="fcard__head"><span class="fcard__ava" style="background:linear-gradient(135deg,${g})">${ini}</span><div><p class="fcard__name">${n}${icon('i-star')}</p><p class="fcard__role">${r}</p><p class="fcard__stars">${icon('i-star').repeat(5)}</p></div></div><p>“ ${esc(q)} ”</p></article>`
    })
    .join('')

  // ================= SLIDER (cuộn ngang, chấm, tự chạy) =================
  const initSlider = (root) => {
    const track = $('.slider__track', root)
    const dotsBox = $('.slider__dots', root)
    const prev = $('.slider__nav--prev', root)
    const next = $('.slider__nav--next', root)
    const auto = +root.dataset.auto || 0
    let pages = 1
    let hold = false
    const step = () => {
      const first = track.children[0]
      if (!first) return track.clientWidth
      return first.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0)
    }
    const perView = () => Math.max(1, Math.round((track.clientWidth + 1) / step()))
    const page = () => {
      const max = track.scrollWidth - track.clientWidth
      if (max <= 2) return 0
      if (track.scrollLeft >= max - 2) return pages - 1
      return Math.round(track.scrollLeft / (step() * perView()))
    }
    const go = (i) => track.scrollTo({ left: ((i + pages) % pages) * step() * perView(), behavior: 'smooth' })
    const sync = () => {
      const p = page()
      if (dotsBox) $$('button', dotsBox).forEach((b, i) => b.classList.toggle('is-active', i === p))
      if (prev) prev.disabled = track.scrollLeft <= 2
      if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2
    }
    const build = () => {
      pages = track.scrollWidth - track.clientWidth > 2 ? Math.ceil(track.children.length / perView()) : 1
      if (dotsBox) {
        dotsBox.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button type="button" aria-label="Trang ${i + 1}"></button>`).join('') : ''
        $$('button', dotsBox).forEach((b, i) => b.addEventListener('click', () => go(i)))
      }
      sync()
    }
    let raf = 0
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync) }, { passive: true })
    prev?.addEventListener('click', () => track.scrollBy({ left: -step() * perView(), behavior: 'smooth' }))
    next?.addEventListener('click', () => track.scrollBy({ left: step() * perView(), behavior: 'smooth' }))
    if (auto) {
      setInterval(() => !hold && !document.hidden && pages > 1 && go(page() + 1), auto)
      root.addEventListener('pointerenter', () => (hold = true))
      root.addEventListener('pointerleave', () => (hold = false))
      track.addEventListener('touchstart', () => (hold = true), { passive: true })
      track.addEventListener('touchend', () => setTimeout(() => (hold = false), 4000), { passive: true })
    }
    new ResizeObserver(build).observe(track)
  }
  $$('[data-slider]').forEach(initSlider)

  // ================= POPUP (thông báo, video) =================
  const modal = $('.modal')
  const box = $('.modal__box', modal)
  const body = $('.modal__body', modal)
  let lastFocus = null
  const openModal = (html, size = '') => {
    lastFocus = document.activeElement
    body.innerHTML = html
    box.className = 'modal__box' + (size ? ' is-' + size : '')
    modal.hidden = false
    document.body.classList.add('is-locked')
    setTimeout(() => ($('a, button, video', body) || $('.modal__x', modal)).focus({ preventScroll: true }), 30)
  }
  const closeModal = () => {
    if (modal.hidden) return
    $$('video', body).forEach((v) => v.pause())
    modal.hidden = true
    body.innerHTML = ''
    document.body.classList.remove('is-locked')
    lastFocus?.focus?.({ preventScroll: true })
  }
  $$('[data-close-modal]', modal).forEach((el) => el.addEventListener('click', closeModal))

  // ================= ĐẶT LỊCH =================
  const form = $('[data-form="book"]')
  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const nav = $('.nav')
    const off = id === 'top' ? 0 : (nav && getComputedStyle(nav).display !== 'none' ? nav.offsetHeight : 0) + 6
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: 'smooth' })
  }
  // Bấm thẻ dịch vụ / giá / ưu đãi → cuộn tới form, chọn sẵn dịch vụ và ghi chú
  const book = (service, note) => {
    if (service) {
      if (![...select.options].some((o) => o.value === service)) select.add(new Option(service, service), 0)
      select.value = service
    }
    if (note) form.elements.note.value = 'Quan tâm: ' + note
    scrollToId('dat-lich')
    setTimeout(() => form.elements.name.focus({ preventScroll: true }), 700)
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const { name, phone } = form.elements
    const err = $('.bform__err', form)
    $$('.is-invalid', form).forEach((el) => el.classList.remove('is-invalid'))
    let msg = ''
    if (!validPhone(phone.value)) { phone.classList.add('is-invalid'); msg = 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).' }
    if (!name.value.trim()) { name.classList.add('is-invalid'); msg = 'Vui lòng nhập họ tên.' }
    err.textContent = msg
    err.hidden = !msg
    if (msg) { $('.is-invalid', form).focus(); return }
    const first = name.value.trim().split(' ').pop()
    const tel = normPhone(phone.value)
    form.reset()
    openModal(`<div class="done"><span class="done__ic">${icon('i-check')}</span><h3>Đặt lịch thành công!</h3><p>Cảm ơn ${esc(first)}, AUTO HC 579 sẽ gọi lại số ${esc(tel)} để xác nhận lịch hẹn.</p><a class="btn btn--orange" href="tel:${C.tel}">${icon('i-phone')} Gọi ngay ${C.hotlineDots}</a><button class="btn btn--line" type="button" data-close>Đóng</button></div>`, 'sm')
  })
  form.addEventListener('input', (e) => e.target.classList.remove('is-invalid'))

  // ================= CLICK CHUNG =================
  document.addEventListener('click', (e) => {
    const t = e.target
    const bk = t.closest('[data-book]')
    if (bk) { e.preventDefault(); book(bk.dataset.book, bk.dataset.note); return }
    const vc = t.closest('[data-video]')
    if (vc) { const v = videos[+vc.dataset.video]; openModal(`<video src="${v.src}" controls autoplay playsinline poster="${v.img}" aria-label="${esc(v.t)}"></video>`, 'video'); return }
    if (t.closest('[data-close]')) { closeModal(); return }
    const a = t.closest('a[href^="#"]')
    if (a && a.getAttribute('href').length > 1) { e.preventDefault(); scrollToId(a.getAttribute('href').slice(1)) }
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return closeModal()
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.pcard, .vcard, .scard')) { e.preventDefault(); e.target.click() }
  })
  // Chân trang dạng xếp trên điện thoại
  $$('.fcol h4').forEach((h) => h.addEventListener('click', () => h.parentElement.classList.toggle('is-open')))

  // ================= BẢN ĐỒ (tải khi cuộn tới) + HIỆN DẦN =================
  const mapFrame = $('[data-map-embed]')
  const io = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (!en.isIntersecting) return
      if (en.target === mapFrame) mapFrame.src = C.embed
      else en.target.classList.add('is-in')
      io.unobserve(en.target)
    })
  }, { rootMargin: '0px 0px -40px 0px' })
  io.observe(mapFrame)
  $$('.stitle, .feat, .promo, .qr, .about__title').forEach((el) => el.classList.add('reveal'))
  $$('.reveal').forEach((el) => io.observe(el))

  // ================= LÊN ĐẦU TRANG =================
  const top = $('.totop')
  addEventListener('scroll', () => (top.hidden = scrollY < 700), { passive: true })
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
})()
