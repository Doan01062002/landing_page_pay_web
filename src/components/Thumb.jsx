// Ảnh xem trước tĩnh của một mẫu (chụp bằng scripts/thumbs.mjs): nhẹ hơn nhiều so với nhúng iframe website thật,
// lướt trên điện thoại không giật. Ảnh cao 3 màn hình: rê chuột vào thẻ thì ảnh cuộn xuống (motion.css).
// Màn cảm ứng không rê chuột được nên chỉ cần phần đầu (1/3 trên, <key>-top.webp, nhẹ hơn ~65%).
const files = import.meta.glob('../assets/thumbs/*.webp', { eager: true, query: '?url', import: 'default' })
const urls = Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url]))

export default function Thumb({ k, alt = '' }) {
  return (
    <div className="thumb">
      {urls[k] && (
        <picture>
          {urls[`${k}-top`] && <source media="(hover: none)" srcSet={urls[`${k}-top`]} type="image/webp" />}
          <img src={urls[k]} alt={alt} width="720" height="1350" loading="lazy" decoding="async" />
        </picture>
      )}
    </div>
  )
}
