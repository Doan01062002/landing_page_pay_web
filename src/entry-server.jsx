// Dựng HTML phía máy chủ cho các trang công khai (SEO): dùng bởi server (SSR trên VPS) và scripts/prerender.mjs (bản tĩnh).
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'
import { SiteDataProvider } from './lib/siteData.jsx'
import { HeadProvider, createHeadCollector, headHtml } from './lib/seo.jsx'
import { StatusProvider } from './lib/status.jsx'

export { defaultBootstrap } from './data/bootstrap.js'

// boot: dữ liệu khởi động (thương hiệu, Kho mẫu, hỏi đáp…) + origin (https://ten-mien) để tạo canonical / og:url
export function render(url, boot) {
  const head = createHeadCollector(boot.origin || '')
  const status = { code: 200 }
  const html = renderToString(
    <React.StrictMode>
      <SiteDataProvider boot={boot}>
        <HeadProvider collector={head}>
          <StatusProvider value={status}>
            <StaticRouter location={url} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <App />
            </StaticRouter>
          </StatusProvider>
        </HeadProvider>
      </SiteDataProvider>
    </React.StrictMode>,
  )
  return { html, head: head.data ? headHtml(head.data) : '', status: status.code }
}
