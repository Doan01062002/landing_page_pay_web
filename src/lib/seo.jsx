// Thẻ SEO cho từng trang: title, description, canonical, Open Graph / Twitter, robots và JSON-LD.
// - Phía máy chủ (SSR / dựng sẵn): <Seo> ghi dữ liệu vào HeadCollector, máy chủ chèn thẻ vào <head>.
// - Phía trình duyệt: <Seo> cập nhật document.head khi chuyển trang.
import { createContext, useContext, useEffect } from 'react'
import { useSeoDefaults, useSite } from './siteData.jsx'

const HeadCtx = createContext(null)
export const HeadProvider = ({ collector, children }) => <HeadCtx.Provider value={collector}>{children}</HeadCtx.Provider>

export function createHeadCollector(origin = '') {
  return {
    origin,
    data: null,
    set(d) {
      this.data = d
    },
  }
}

const abs = (origin, url) => (!url ? '' : /^https?:/.test(url) ? url : `${origin || ''}${url}`)

// Gom dữ liệu SEO cuối cùng của trang (dùng chung cho máy chủ và trình duyệt)
export function resolveSeo(props, site, defaults, origin) {
  const title = props.title ? `${props.title} | ${site.brand}` : defaults.title
  return {
    title,
    description: (props.description || defaults.description || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    canonical: props.path ? abs(origin, props.path) : '',
    image: abs(origin, props.image || defaults.image),
    type: props.type || 'website',
    noindex: !!props.noindex,
    jsonLd: (props.jsonLd || []).filter(Boolean),
    siteName: site.brand,
  }
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// JSON-LD an toàn trong <script>: chặn chuỗi "</script>"
const ldJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

// HTML các thẻ <head> (máy chủ chèn vào trang)
export function headHtml(h) {
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}">`,
    h.noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">',
    h.canonical && `<link rel="canonical" href="${esc(h.canonical)}">`,
    `<meta property="og:type" content="${esc(h.type)}">`,
    `<meta property="og:site_name" content="${esc(h.siteName)}">`,
    `<meta property="og:locale" content="vi_VN">`,
    `<meta property="og:title" content="${esc(h.title)}">`,
    `<meta property="og:description" content="${esc(h.description)}">`,
    h.canonical && `<meta property="og:url" content="${esc(h.canonical)}">`,
    h.image && `<meta property="og:image" content="${esc(h.image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(h.title)}">`,
    `<meta name="twitter:description" content="${esc(h.description)}">`,
    h.image && `<meta name="twitter:image" content="${esc(h.image)}">`,
    ...h.jsonLd.map((o) => `<script type="application/ld+json">${ldJson(o)}</script>`),
  ]
  return tags.filter(Boolean).join('\n    ')
}

// Cập nhật <head> phía trình duyệt khi chuyển trang trong ứng dụng
function applyHead(h) {
  document.title = h.title
  const meta = (attr, key, content) => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`)
    if (!content) return el?.remove()
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }
  meta('name', 'description', h.description)
  meta('name', 'robots', h.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  meta('property', 'og:type', h.type)
  meta('property', 'og:title', h.title)
  meta('property', 'og:description', h.description)
  meta('property', 'og:url', h.canonical)
  meta('property', 'og:image', h.image)
  meta('name', 'twitter:title', h.title)
  meta('name', 'twitter:description', h.description)
  meta('name', 'twitter:image', h.image)
  let link = document.head.querySelector('link[rel="canonical"]')
  if (h.canonical) {
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = h.canonical
  } else link?.remove()
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove())
  h.jsonLd.forEach((o) => {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify(o)
    document.head.appendChild(s)
  })
}

export function Seo(props) {
  const site = useSite()
  const defaults = useSeoDefaults()
  const collector = useContext(HeadCtx)
  const origin = collector?.origin ?? (typeof window !== 'undefined' ? window.__CA_BOOT__?.origin || window.location.origin : '')
  const h = resolveSeo(props, site, defaults, origin)
  if (collector) collector.set(h)
  const key = JSON.stringify(h)
  useEffect(() => {
    applyHead(JSON.parse(key))
  }, [key])
  return null
}

// ---------- JSON-LD dùng lại ----------
export const ld = {
  organization: (site, origin) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.brand,
    legalName: site.company?.split('·')[0]?.trim(),
    url: origin || undefined,
    logo: abs(origin, site.logo),
    email: site.email,
    telephone: site.hotline,
    address: { '@type': 'PostalAddress', streetAddress: site.address, addressCountry: 'VN' },
    sameAs: [site.facebookUrl, site.zaloUrl].filter(Boolean),
  }),
  website: (site, origin) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.brand,
    url: origin || undefined,
    inLanguage: 'vi-VN',
    potentialAction: { '@type': 'SearchAction', target: `${origin}/mau-phan-mem?key={search_term_string}`, 'query-input': 'required name=search_term_string' },
  }),
  breadcrumb: (origin, items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(origin, path) })),
  }),
  faq: (faqs) =>
    faqs.length && {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
}
export function useOrigin() {
  const collector = useContext(HeadCtx)
  return collector?.origin ?? (typeof window !== 'undefined' ? window.__CA_BOOT__?.origin || window.location.origin : '')
}
