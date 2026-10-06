/* Gara Nhật Đức – landing page interactions (vanilla JS, không phụ thuộc thư viện) */

/* ================== CẤU HÌNH – chỉnh tại đây ================== */
const CONFIG = {
  // URL nhận dữ liệu form (Google Apps Script Web App, webhook CRM, Make/Zapier…).
  // Để trống: lưu tạm vào trình duyệt + hiện popup cảm ơn.
  formEndpoint: '',
  // Video của khối video lớn: link 1 video TikTok hoặc YouTube → phát ngay trên trang (popup).
  videoLink: 'https://www.tiktok.com/@garaotonhatduc/video/7657133340587281685',
  fanpage: 'https://www.facebook.com/garanhatduclongbien/',
  youtubeChannel: 'https://www.youtube.com/@minhhoiauto-garanhatduc',
  tiktok: 'https://www.tiktok.com/@garaotonhatduc',
};
/* ============================================================== */

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // Thương hiệu muốn hiệu ứng luôn chạy, kể cả khi Windows/macOS tắt "Animation effects".
  const reduceMotion = false;

  /* ---------- Header: shrink, progress, back-to-top, active link ---------- */
  const header = $('.header');
  const progress = $('.scroll-progress span');
  const toTop = $('.to-top');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-show', y > 700);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    updateSteps();
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  const navLinks = $$('.nav a[href^="#"]');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['dich-vu', 'bang-gia', 'quy-trinh', 'dat-lich', 'lien-he'].forEach((id) => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.innerHTML = `<svg class="ic"><use href="#i-${open ? 'x' : 'menu'}"/></svg>`;
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  /* ---------- Smooth scroll chính xác tới mục (bù chiều cao header) ---------- */
  const scrollTargetFor = (id) => {
    // Trên điện thoại, "Đặt lịch" cuộn thẳng tới phiếu đặt lịch thay vì đầu section
    if (id === 'dat-lich' && innerWidth <= 960) return $('#bookingForm');
    return document.getElementById(id);
  };
  const headerOffset = () => (innerWidth <= 640 ? 60 : 64) + 14;
  const goTo = (id) => {
    const el = scrollTargetFor(id);
    if (!el) return;
    const y = () => Math.max(0, el.getBoundingClientRect().top + scrollY - headerOffset());
    scrollTo({ top: y(), behavior: 'smooth' });
    // Ảnh lazy / header co lại có thể làm lệch vị trí → căn lại sau khi cuộn xong
    let done = false;
    const fix = () => {
      if (done) return; done = true;
      if (Math.abs(el.getBoundingClientRect().top - headerOffset()) > 6) scrollTo({ top: y(), behavior: 'smooth' });
      if (id === 'dat-lich') setTimeout(() => $('#f-name')?.focus({ preventScroll: true }), 350);
    };
    addEventListener('scrollend', fix, { once: true });
    setTimeout(fix, 1100);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || id === 'top') return;
    if (!document.getElementById(id)) return;
    e.preventDefault();
    goTo(id);
    history.replaceState(null, '', '#' + id);
  });
  document.addEventListener('click', (e) => { if (nav.classList.contains('is-open') && !e.target.closest('#nav, #burger')) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .hl-blue').forEach((el) => revealObs.observe(el));

  /* ---------- Hero slideshow (Ken Burns) ---------- */
  const slides = $('.hero__slide');
  const bars = $('.hero__bars i');
  if (slides.length > 1 && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove('is-active');
      if (bars[i]) bars[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
      if (bars[i]) bars[i].classList.add('is-active');
    }, 6000);
  }

  /* ---------- Hero text rotator ---------- */
  const words = $$('.rotator span');
  if (words.length > 1 && !reduceMotion) {
    let w = 0;
    setInterval(() => {
      const cur = words[w];
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      setTimeout(() => cur.classList.remove('is-out'), 500);
      w = (w + 1) % words.length;
      words[w].classList.add('is-on');
    }, 2400);
  }

  /* ---------- Counters ---------- */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const fmt = (v) => v.toFixed(dec).replace('.', ',');
      if (reduceMotion) { el.textContent = fmt(target); return; }
      const dur = 1600; const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObs.observe(el));

  /* ---------- Pricing tabs ---------- */
  const tabs = $$('.tab');
  const panels = $$('.tab-panel');
  const ink = $('.tabs__ink');
  const moveInk = (btn) => {
    if (!btn || !ink) return;
    ink.style.width = btn.offsetWidth + 'px';
    ink.style.transform = `translateX(${btn.offsetLeft}px)`;
  };
  const selectTab = (idx, focus = false) => {
    tabs.forEach((t, k) => {
      const on = k === idx;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      panels[k].classList.toggle('is-active', on);
    });
    moveInk(tabs[idx]);
    $('.plans', panels[idx])?.dispatchEvent(new Event('scroll'));
    tabs[idx].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    if (focus) tabs[idx].focus();
  };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => selectTab(k));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') selectTab((k + 1) % tabs.length, true);
      if (e.key === 'ArrowLeft') selectTab((k - 1 + tabs.length) % tabs.length, true);
    });
  });
  addEventListener('resize', () => moveInk($('.tab.is-active')));
  document.fonts?.ready.then(() => moveInk($('.tab.is-active')));
  moveInk($('.tab.is-active'));
  $$('[data-tab]').forEach((a) => a.addEventListener('click', () => selectTab(+a.dataset.tab)));

  /* ---------- Chấm chỉ báo cho bảng giá dạng trượt ngang (mobile) ---------- */
  $$('.plans').forEach((list) => {
    const cards = $$('.plan', list);
    const dots = document.createElement('div');
    dots.className = 'plans-dots';
    dots.innerHTML = cards.map(() => '<span></span>').join('');
    list.after(dots);
    const sync = () => {
      const mid = list.scrollLeft + list.clientWidth / 2;
      let best = 0;
      cards.forEach((c, k) => { if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = k; });
      $$('span', dots).forEach((d, k) => d.classList.toggle('is-on', k === best));
    };
    list.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    sync();
  });

  /* ---------- Promo month ---------- */
  const now = new Date();
  $$('[data-month]').forEach((el) => { el.textContent = `tháng ${now.getMonth() + 1}/${now.getFullYear()}`; });
  $$('[data-year]').forEach((el) => { el.textContent = now.getFullYear(); });

  /* ---------- Process line fill ---------- */
  const steps = $('.steps');
  const stepItems = $$('.step');
  function updateSteps() {
    if (!steps) return;
    const r = steps.getBoundingClientRect();
    const start = innerHeight * 0.85;
    const prog = Math.max(0, Math.min(1, (start - r.top) / (r.height + innerHeight * 0.25)));
    steps.style.setProperty('--prog', prog.toFixed(3));
    stepItems.forEach((s, k) => s.classList.toggle('is-lit', prog >= (k + 0.2) / stepItems.length));
  }
  updateSteps();

  /* ---------- Service links → preselect form dropdown ---------- */
  const serviceInput = $('#f-service');
  const picked = $('#pickedService');
  const setService = (name) => {
    serviceInput.value = name || '';
    picked.hidden = !name;
    $('b', picked).textContent = name || '';
  };
  $$('[data-service]').forEach((a) => a.addEventListener('click', () => setService(a.dataset.service)));

  /* ---------- Gallery lightbox ---------- */
  const items = $$('#gallery .g-item');
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  const lbCap = $('figcaption', lb);
  let cur = 0;
  let lastFocus = null;
  const show = (k) => {
    cur = (k + items.length) % items.length;
    lbImg.src = items[cur].getAttribute('href');
    lbImg.alt = $('img', items[cur]).alt;
    lbCap.textContent = items[cur].dataset.caption || '';
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  };
  const openLb = (k) => { lastFocus = document.activeElement; show(k); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lightbox__close', lb).focus(); };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); };
  items.forEach((a, k) => a.addEventListener('click', (e) => { e.preventDefault(); openLb(k); }));
  $('.lightbox__close', lb).addEventListener('click', closeLb);
  $('.lightbox__nav--prev', lb).addEventListener('click', () => show(cur - 1));
  $('.lightbox__nav--next', lb).addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    }
    if (!modal.hidden && e.key === 'Escape') closeModal();
  });

  /* ---------- Before / After slider ---------- */
  const ba = $('#ba');
  if (ba) {
    const range = $('.ba__range', ba);
    range.addEventListener('input', () => ba.style.setProperty('--pos', range.value + '%'));
    // gợi ý kéo khi lần đầu xuất hiện
    const hintObs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || reduceMotion) return;
      hintObs.disconnect();
      const seq = [50, 30, 70, 50]; let s = 0;
      const step = () => { if (s >= seq.length) return; range.value = seq[s]; ba.style.setProperty('--pos', seq[s] + '%'); s++; setTimeout(step, 450); };
      ba.querySelectorAll('.ba__before-wrap, .ba__handle').forEach((el) => { el.style.transition = 'clip-path .45s ease, left .45s ease'; });
      step();
      setTimeout(() => ba.querySelectorAll('.ba__before-wrap, .ba__handle').forEach((el) => { el.style.transition = ''; }), 2200);
    }, { threshold: 0.6 });
    hintObs.observe(ba);
  }

  /* ---------- Video: phát TikTok / YouTube ngay trên trang (popup) ---------- */
  // Nhận link video TikTok (…/video/<số>), YouTube (watch?v=, youtu.be/, shorts/) hoặc ID YouTube 11 ký tự.
  const parseVideo = (url) => {
    url = (url || '').trim();
    if (!url) return null;
    let m = url.match(/tiktok\.com\/.*\/video\/(\d+)/) || url.match(/^(\d{15,})$/);
    if (m) return { kind: 'tiktok', id: m[1], url: url.includes('tiktok.com') ? url : CONFIG.tiktok };
    m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/) || url.match(/^([\w-]{11})$/);
    if (m) return { kind: 'youtube', id: m[1], url: 'https://www.youtube.com/watch?v=' + m[1] };
    return null;
  };

  const player = $('#vplayer');
  const pFrame = player && $('.vplayer__frame', player);
  let vpFocus = null;
  const openVideo = (v, title) => {
    vpFocus = document.activeElement;
    const ifr = document.createElement('iframe');
    ifr.src = v.kind === 'tiktok'
      ? 'https://www.tiktok.com/player/v1/' + v.id + '?autoplay=1&rel=0&description=1&music_info=0'
      : 'https://www.youtube-nocookie.com/embed/' + v.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    ifr.title = title || 'Video Gara Nhật Đức';
    ifr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    ifr.allowFullscreen = true;
    pFrame.replaceChildren(ifr);
    player.dataset.kind = v.kind;
    $('.vplayer__title', player).textContent = title || '';
    const ext = $('.vplayer__ext', player);
    ext.href = v.url;
    ext.textContent = v.kind === 'tiktok' ? 'Xem trên TikTok' : 'Xem trên YouTube';
    player.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.vplayer__close', player).focus();
  };
  const closeVideo = () => {
    if (!player || player.hidden) return;
    pFrame.replaceChildren(); // xoá iframe = dừng phát
    player.hidden = true;
    document.body.style.overflow = '';
    if (vpFocus && vpFocus.focus) vpFocus.focus();
  };
  if (player) {
    $('.vplayer__close', player).addEventListener('click', closeVideo);
    player.addEventListener('click', (e) => { if (e.target === player) closeVideo(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVideo(); });
  }

  // Có link video hợp lệ → phát trong popup; không có → mở link dự phòng (kênh) ở tab mới.
  const bindVideo = (btn, link, fallback, title) => {
    const v = parseVideo(link);
    btn.addEventListener('click', () => {
      if (v && player) openVideo(v, title);
      else window.open(fallback || CONFIG.fanpage, '_blank', 'noopener');
    });
  };

  const facade = $('#videoFacade');
  const facadeTitle = $('.video__text h3');
  if (facade) bindVideo(facade, CONFIG.videoLink, CONFIG.tiktok, facadeTitle && facadeTitle.textContent);

  $$('.yt').forEach((btn) => bindVideo(btn, btn.dataset.video || btn.dataset.yt, btn.dataset.href, btn.dataset.title));

  /* ---------- Social links from config ---------- */
  $$('[data-social]').forEach((a) => {
    const url = a.dataset.social === 'youtube' ? CONFIG.youtubeChannel : CONFIG.tiktok;
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else { a.href = CONFIG.fanpage; a.target = '_blank'; a.rel = 'noopener'; }
  });

  /* ---------- Reviews carousel ---------- */
  const track = $('#reviews');
  $$('.reviews__nav .round-btn').forEach((b) => b.addEventListener('click', () => {
    const card = $('.review', track);
    const stepPx = card ? card.offsetWidth + 20 : 300;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    if (+b.dataset.dir > 0 && atEnd) track.scrollTo({ left: 0 });
    else track.scrollBy({ left: stepPx * +b.dataset.dir });
  }));
  let autoRev = !reduceMotion && setInterval(() => {
    if (document.hidden) return;
    const r = track.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    $('.reviews__nav [data-dir="1"]')?.click();
  }, 5000);
  ['pointerdown', 'wheel', 'touchstart'].forEach((ev) => track.addEventListener(ev, () => { clearInterval(autoRev); autoRev = null; }, { passive: true }));

  /* ---------- Booking form ---------- */
  const form = $('#bookingForm');
  const modal = $('#successModal');
  const phoneOk = (v) => /^(0|\+?84)(3|5|7|8|9)\d{8}$/.test(v.replace(/[\s.\-]/g, ''));
  const validators = {
    name: (v) => v.trim().length >= 2,
    phone: phoneOk,
  };
  const check = (el) => {
    const fn = validators[el.name];
    if (!fn) return true;
    const ok = fn(el.value);
    el.closest('.field').classList.toggle('is-invalid', !ok);
    return ok;
  };
  $$('input, select', form).forEach((el) => {
    el.addEventListener('blur', () => { if (el.value) check(el); });
    el.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('is-invalid')) check(el); });
    el.addEventListener('change', () => check(el));
  });

  const openModal = (data) => {
    $('[data-out="name"]', modal).textContent = data.name;
    $('[data-out="phone"]', modal).textContent = data.phone;
    modal.hidden = false;
    $('[data-close]', modal).focus();
  };
  const closeModal = () => { modal.hidden = true; };
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const F = (n) => form.elements.namedItem(n);
    if (F('website').value) return; // bot
    const fields = ['name', 'phone'].map(F);
    const results = fields.map(check);
    if (results.includes(false)) { fields[results.indexOf(false)].focus(); return; }

    const data = {
      name: F('name').value.trim(),
      phone: F('phone').value.trim(),
      service: F('service').value || 'Chưa chọn',
      source: location.href,
      createdAt: new Date().toISOString(),
    };
    const btn = $('button[type="submit"]', form);
    btn.classList.add('is-loading'); btn.disabled = true;
    try {
      if (CONFIG.formEndpoint) {
        await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data),
        });
      } else {
        try {
          const list = JSON.parse(localStorage.getItem('cc_bookings') || '[]');
          list.push(data); localStorage.setItem('cc_bookings', JSON.stringify(list));
        } catch (_) { /* storage có thể bị chặn – bỏ qua */ }
        await new Promise((r) => setTimeout(r, 700));
      }
      // Sự kiện chuyển đổi cho GA4 / Facebook Pixel nếu có gắn
      window.dataLayer?.push({ event: 'booking_submit', service: data.service });
      window.fbq?.('track', 'Lead', { content_name: data.service });
      openModal(data);
      form.reset();
      setService('');
    } catch (err) {
      alert('Gửi chưa thành công, vui lòng gọi 08 3695 3695 để đặt lịch ngay.');
    } finally {
      btn.classList.remove('is-loading'); btn.disabled = false;
    }
  });

  onScroll();
})();
