// Cấu hình trang quản trị cho từng mẫu trong Kho mẫu.
// key: mẫu dựng riêng = du-an-<slug>, mẫu phần mềm = <slug> (giống tên ảnh xem trước).
// profile quyết định bộ chức năng: gara (dịch vụ, lịch hẹn, phiếu sửa chữa) · shop (đơn hàng, sản phẩm, kho) · showroom (xe, khách quan tâm, đặt cọc).
import { projects } from '../data/projects.js'
import { templates } from '../data/templates.js'

const SHOP = ['du-an-dopro', 'du-an-ankhang', 'du-an-lumen', 'du-an-vanhviet', 'du-an-bongstudio', 'partshub', 'lopviet']
const SHOWROOM = ['du-an-vinfast', 'du-an-tinviet', 'du-an-hungthinh', 'vinfast', 'xpander', 'xeluot']
// có công cụ định giá / ký gửi xe cũ
const USED = ['du-an-tinviet', 'du-an-hungthinh', 'xeluot']
// có ảnh trước / sau (thư viện công trình)
const GALLERY = ['shine', 'thanhdat', 'du-an-bongstudio', 'du-an-dopro', 'du-an-nhatduc', 'du-an-nhatduc-ladi', 'du-an-nhatduc-motion', 'du-an-minhphat']
// cửa hàng có dịch vụ thi công tại xưởng (bảng giá dịch vụ)
const SHOP_SERVICES = ['du-an-dopro', 'du-an-bongstudio', 'du-an-lumen', 'du-an-vanhviet']
// showroom bán thêm phụ kiện (đơn hàng, sản phẩm)
const SHOWROOM_SHOP = ['du-an-hungthinh']

// Màu nhận diện cho mẫu chưa khai báo rõ
const ACCENTS = { 'du-an-ankhang': '#f05a22', 'du-an-lumen': '#1658d6', 'du-an-vanhviet': '#1554c0', 'du-an-bongstudio': '#0f766e', 'du-an-hungthinh': '#1b2a4e', 'du-an-tinviet': '#c8102e', 'du-an-dopro': '#d71920' }

const short = (name) => name.split(/\s[–-]\s/)[0]

export function getAdminSite(key) {
  if (!key) return null
  let base
  if (key.startsWith('du-an-')) {
    const p = projects.find((x) => `du-an-${x.slug}` === key)
    if (!p) return null
    base = {
      kind: 'project',
      slug: p.slug,
      name: short(p.name),
      fullName: p.name,
      accent: ACCENTS[key] || p.accent || '#ea212b',
      hotline: p.hotline,
      address: p.area,
      hours: '8:00 – 18:00',
      siteUrl: p.url,
      demoUrl: `/demo-du-an/${p.slug}`,
      category: p.category,
      type: p.type,
    }
  } else {
    const t = templates.find((x) => x.slug === key)
    if (!t) return null
    base = {
      kind: 'template',
      slug: t.slug,
      name: [t.brand.name, t.brand.suffix].filter(Boolean).join(' '),
      fullName: t.name,
      accent: t.palettes[0].p,
      hotline: t.brand.hotline,
      address: t.brand.address,
      hours: t.brand.hours,
      siteUrl: `/preview/${t.slug}`,
      demoUrl: `/demo/${t.slug}`,
      category: t.category,
      template: t,
    }
  }
  const profile = SHOP.includes(key) ? 'shop' : SHOWROOM.includes(key) ? 'showroom' : 'gara'
  const flags = {
    used: USED.includes(key),
    gallery: GALLERY.includes(key),
    shopServices: SHOP_SERVICES.includes(key),
    accessories: SHOWROOM_SHOP.includes(key),
    moto: base.category === 'xemay',
  }
  return { key, ...base, profile, flags, modules: modulesFor(profile, flags) }
}

// Danh sách chức năng (thứ tự = thứ tự trên thanh bên), theo nhóm
export function modulesFor(profile, f) {
  const m = []
  const add = (group, ...ids) => ids.forEach((id) => id && m.push({ id, group }))
  add('Tổng quan', 'dashboard', 'reports')
  if (profile === 'gara') {
    add('Dịch vụ', 'bookings', 'repairOrders', 'vehicles', 'services', 'parts', f.gallery && 'gallery')
  }
  if (profile === 'shop') {
    add('Bán hàng', 'orders', 'installs', 'flashsales', 'promotions')
    add('Sản phẩm', 'products', 'categories', 'stockReceipts', f.shopServices && 'services', f.gallery && 'gallery')
  }
  if (profile === 'showroom') {
    add('Kinh doanh xe', 'cars', 'leads', 'testDrives', 'deposits', 'loans', f.used && 'consignments')
    if (f.accessories) add('Phụ kiện', 'orders', 'products', 'categories')
  }
  add('Khách hàng', 'customers', 'reviews', profile !== 'shop' && 'promotions')
  add('Website', 'content', 'posts')
  add('Hệ thống', 'branches', 'staff', 'settings')
  return m
}

// Tất cả mẫu có trang quản trị (trang /quan-tri liệt kê)
export function allAdminSites() {
  return [...projects.map((p) => `du-an-${p.slug}`), ...templates.map((t) => t.slug)].map(getAdminSite).filter(Boolean)
}

export const PROFILE_LABEL = { gara: 'Gara & dịch vụ', shop: 'Cửa hàng bán lẻ', showroom: 'Showroom & đại lý xe' }
