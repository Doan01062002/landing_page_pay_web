// sitemap.xml và robots.txt (dùng cho máy chủ và bản dựng tĩnh scripts/prerender.mjs)
import { mergeCatalog } from '../src/data/catalog.js'

export function sitemapRoutes(catalog) {
  const { templates } = mergeCatalog(catalog)
  return [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/mau-phan-mem', priority: '0.9', changefreq: 'weekly' },
    ...templates.map((t) => ({ path: `/mau-phan-mem/${t.slug}`, priority: '0.8', changefreq: 'monthly' })),
    { path: '/mau-landing-page', priority: '0.6', changefreq: 'monthly' },
  ]
}

const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function sitemapXml(origin, catalog, lastmod = new Date().toISOString().slice(0, 10)) {
  const urls = sitemapRoutes(catalog)
    .map((r) => `  <url><loc>${xmlEsc(origin + r.path)}</loc><lastmod>${lastmod}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

// Trang chỉ dành cho xem thử / quản trị: không cho máy tìm kiếm thu thập
export const PRIVATE_PATHS = ['/admin', '/quan-tri', '/preview', '/demo', '/demo-landing', '/demo-du-an', '/lp', '/api']

export function robotsTxt(origin) {
  return ['User-agent: *', 'Allow: /', ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`), ...(origin ? ['', `Sitemap: ${origin}/sitemap.xml`] : []), ''].join('\n')
}

// Nhúng dữ liệu khởi động vào trang (chặn chuỗi đóng thẻ script)
export function bootScript(boot) {
  // đổi < > & và U+2028 / U+2029 thành dạng \uXXXX: chặn chuỗi đóng thẻ script, giữ JSON hợp lệ
  const BS = String.fromCharCode(92) // dấu gạch chéo ngược
  const esc = (c) => BS + 'u' + c.charCodeAt(0).toString(16).padStart(4, '0')
  const json = JSON.stringify(boot)
    .replace(/[<>&]/g, esc)
    .split(String.fromCharCode(0x2028)).join(esc(String.fromCharCode(0x2028)))
    .split(String.fromCharCode(0x2029)).join(esc(String.fromCharCode(0x2029)))
  return `<script>window.__CA_BOOT__=${json}</script>`
}

// Ghép HTML: thay khối head mặc định bằng thẻ SEO của trang, chèn nội dung đã dựng và dữ liệu khởi động
export function fillTemplate(template, { head = '', html = '', boot, noindex = false }) {
  let out = template
  if (head) out = out.replace(/<!--head:start-->[\s\S]*?<!--head:end-->/, head)
  else if (noindex) out = out.replace('<!--head:end-->', '<meta name="robots" content="noindex, nofollow" />\n    <!--head:end-->')
  return out.replace('<!--app-html-->', html).replace('<!--app-boot-->', boot ? bootScript(boot) : '')
}
