import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SiteDataProvider, readBoot } from './lib/siteData.jsx'
import './styles/base.css'
import './styles/motion.css'

// Trang công khai đã được máy chủ dựng sẵn HTML (SSR / dựng tĩnh) → hydrate; các trang khác (demo, quản trị) → render mới.
const root = document.getElementById('root')
const boot = readBoot()
const app = (
  <React.StrictMode>
    <SiteDataProvider boot={boot}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </SiteDataProvider>
  </React.StrictMode>
)
// Chỉ hydrate khi HTML được dựng đúng địa chỉ đang mở. Bản tĩnh (Vercel) dựng sẵn không kèm tham số:
// mở /mau-phan-mem?trang=2 hay trang 404 dùng chung thì HTML khác → vẽ mới thay vì hydrate lệch.
const norm = (u) => String(u || '').replace(/\/+(?=\?|$)/, '') || '/'
if (root.firstElementChild && norm(boot?.url) === norm(window.location.pathname + window.location.search)) hydrateRoot(root, app)
else {
  root.textContent = ''
  createRoot(root).render(app)
}
