// Biểu đồ SVG nhỏ gọn (không dùng thư viện): đường / vùng, cột, vành khuyên. Co giãn theo khung chứa.
import { useState } from 'react'
import { moneyShort } from './lib.js'

export function AreaChart({ data, height = 220, format = moneyShort, color = 'var(--adm-accent)', label = 'Giá trị', second }) {
  const [hover, setHover] = useState(null)
  const W = 640
  const H = height
  const P = { l: 46, r: 12, t: 14, b: 26 }
  const max = Math.max(1, ...data.map((d) => d.value), ...(second ? data.map((d) => d.value2 || 0) : []))
  const nice = niceMax(max)
  const x = (i) => P.l + (i * (W - P.l - P.r)) / Math.max(1, data.length - 1)
  const y = (v) => P.t + (1 - v / nice) * (H - P.t - P.b)
  const line = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key] || 0).toFixed(1)}`).join(' ')
  const area = `${line('value')} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => nice * k)
  const step = Math.ceil(data.length / 7)
  return (
    <div className="adm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="adm-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.22" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="adm-chart__grid" />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="adm-chart__tick">
              {format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          i % step === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="adm-chart__tick">
              {d.label}
            </text>
          ) : null,
        )}
        <path d={area} fill="url(#adm-area)" />
        <path d={line('value')} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
        {second && <path d={line('value2')} fill="none" stroke="var(--adm-ink-3)" strokeWidth="1.6" strokeDasharray="4 4" />}
        {data.map((d, i) => (
          <rect key={i} x={x(i) - (W - P.l - P.r) / data.length / 2} y={P.t} width={(W - P.l - P.r) / data.length} height={H - P.t - P.b} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} className="adm-chart__cursor" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="4.5" fill="#fff" stroke={color} strokeWidth="2.4" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="adm-chart__tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{data[hover].full || data[hover].label}</b>
          <span>
            {label}: {format === moneyShort ? data[hover].value.toLocaleString('vi-VN') + 'đ' : format(data[hover].value)}
          </span>
          {second && (
            <span>
              {second}: {format(data[hover].value2 || 0)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function BarList({ data, format = moneyShort, empty = 'Chưa có dữ liệu' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length) return <p className="adm-muted">{empty}</p>
  return (
    <ul className="adm-barlist">
      {data.map((d) => (
        <li key={d.label}>
          <div className="adm-barlist__row">
            <span title={d.label}>{d.label}</span>
            <b>{format(d.value)}</b>
          </div>
          <div className="adm-barlist__track">
            <i style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Bars({ data, height = 200, format = (v) => v, color = 'var(--adm-accent)' }) {
  const W = 640
  const H = height
  const P = { l: 34, r: 8, t: 12, b: 26 }
  const nice = niceMax(Math.max(1, ...data.map((d) => d.value)))
  const bw = (W - P.l - P.r) / data.length
  const y = (v) => P.t + (1 - v / nice) * (H - P.t - P.b)
  return (
    <div className="adm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        {[0, 0.5, 1].map((k) => (
          <g key={k}>
            <line x1={P.l} x2={W - P.r} y1={y(nice * k)} y2={y(nice * k)} className="adm-chart__grid" />
            <text x={P.l - 6} y={y(nice * k) + 4} textAnchor="end" className="adm-chart__tick">
              {format(nice * k)}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={i}>
            <rect x={P.l + i * bw + bw * 0.18} y={y(d.value)} width={bw * 0.64} height={H - P.b - y(d.value)} rx="3" fill={d.color || color}>
              <title>
                {d.label}: {format(d.value)}
              </title>
            </rect>
            <text x={P.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="adm-chart__tick">
              {d.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

const DONUT_COLORS = ['var(--adm-accent)', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#64748b', '#ec4899']
export function Donut({ data, size = 168, center, format = (v) => v.toLocaleString('vi-VN') }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const R = 15.915
  let acc = 0
  return (
    <div className="adm-donut">
      <svg viewBox="0 0 42 42" width={size} height={size} role="img">
        <circle cx="21" cy="21" r={R} fill="none" stroke="var(--adm-line)" strokeWidth="6" />
        {data.map((d, i) => {
          const pct = (d.value / total) * 100
          const el = (
            <circle key={d.label} cx="21" cy="21" r={R} fill="none" stroke={d.color || DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={25 - acc}>
              <title>
                {d.label}: {format(d.value)}
              </title>
            </circle>
          )
          acc += pct
          return el
        })}
        {center && (
          <text x="21" y="22.6" textAnchor="middle" className="adm-donut__center">
            {center}
          </text>
        )}
      </svg>
      <ul>
        {data.map((d, i) => (
          <li key={d.label}>
            <i style={{ background: d.color || DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span>{d.label}</span>
            <b>{format(d.value)}</b>
            <em>{Math.round((d.value / total) * 100)}%</em>
          </li>
        ))}
      </ul>
    </div>
  )
}

function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p
}
