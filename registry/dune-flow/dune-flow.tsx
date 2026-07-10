'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * DuneAreaChart — smooth stacked area "flow" (Linear Insights genre).
 *
 * Answers: what was the flow made of, and when did the waves happen?
 * Smoothing is a uniform cubic B-spline (basis, d3 curveBasis algorithm): the
 * curve does NOT pass through the data points — that is the point of the genre
 * (dunes, not spikes); the honest raw values live in the tooltip. Layers are
 * drawn as cumulative areas top-to-bottom with opaque fills, so there are no
 * seams between layers by construction. A B-spline is a convex combination of
 * points, so boundaries never dip below the baseline or cross — no clamps.
 * Interaction: crosshair, tooltip with a date title and series in stack order
 * (composition, not sorted by value), a dot on the top edge of the stack plus
 * a dot on the baseline, and a dashed max line.
 *
 * Props:
 *   days     string[]        — ISO dates (YYYY-MM-DD), one per column; ≥4
 *   series   DuneSeries[]    — stack order = bottom→top; each carries its color
 *   yLabel   string?         — accessible label for the chart
 */

export type DuneSeries = {
  label: string
  color: string
  /** stack order = order of series bottom→top; null counts as zero */
  values: Array<number | null>
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function fmtDay(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${MONTHS[Number(month) - 1] ?? ''} ${Number(day)}`
}

function fmtDayYear(iso: string): string {
  const [year] = iso.split('-')
  return `${fmtDay(iso)} ${year}`
}

function fmtValue(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}M`
  if (value >= 10_000) return `${Math.round(value / 1_000)}K`
  return String(Math.round(value * 10) / 10)
}

const r2 = (v: number) => Math.round(v * 100) / 100

type Pt = { x: number; y: number }

/** Uniform cubic B-spline over control points — d3 curveBasis algorithm. */
function basisPath(pts: Pt[]): string {
  const n = pts.length
  if (n === 0) return ''
  if (n === 1) return `M${r2(pts[0].x)},${r2(pts[0].y)}`
  if (n === 2) return `M${r2(pts[0].x)},${r2(pts[0].y)}L${r2(pts[1].x)},${r2(pts[1].y)}`
  const bez = (a: Pt, b: Pt, c: Pt) =>
    `C${r2((2 * a.x + b.x) / 3)},${r2((2 * a.y + b.y) / 3)},${r2((a.x + 2 * b.x) / 3)},${r2(
      (a.y + 2 * b.y) / 3
    )},${r2((a.x + 4 * b.x + c.x) / 6)},${r2((a.y + 4 * b.y + c.y) / 6)}`
  let d = `M${r2(pts[0].x)},${r2(pts[0].y)}L${r2((5 * pts[0].x + pts[1].x) / 6)},${r2(
    (5 * pts[0].y + pts[1].y) / 6
  )}`
  for (let i = 2; i < n; i++) d += bez(pts[i - 2], pts[i - 1], pts[i])
  d += bez(pts[n - 2], pts[n - 1], pts[n - 1])
  d += `L${r2(pts[n - 1].x)},${r2(pts[n - 1].y)}`
  return d
}

const W = 960
const H = 380
const PAD = { top: 22, right: 30, bottom: 40, left: 54 }

export function DuneAreaChart({
  days,
  series,
  yLabel,
}: {
  days: string[]
  series: DuneSeries[]
  yLabel?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const node = wrapRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setEntered(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const geometry = useMemo(() => {
    const n = days.length
    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom
    // Cumulative stack boundaries: boundaries[k][i] = sum of series 0..k-1 on day i
    const boundaries: number[][] = [Array.from({ length: n }, () => 0)]
    for (const s of series) {
      const prev = boundaries[boundaries.length - 1]
      boundaries.push(prev.map((b, i) => b + (s.values[i] ?? 0)))
    }
    const totals = boundaries[boundaries.length - 1]
    const rawMax = Math.max(...totals, 1)
    // Clean ticks: step 1-2-2.5-5 × 10^k for 4-5 divisions, top a multiple of step
    const stepMag = 10 ** Math.floor(Math.log10(rawMax / 4))
    const yStep =
      [1, 2, 2.5, 5, 10].map((m) => m * stepMag).find((m) => m * 5 >= rawMax) ?? rawMax / 4
    const yMax = yStep * Math.ceil(rawMax / yStep)
    const yTicks = Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, i) => i * yStep)
    const sx = (index: number) => PAD.left + (index / Math.max(n - 1, 1)) * plotW
    const sy = (value: number) => PAD.top + (1 - value / yMax) * plotH
    // Layers — cumulative areas down to the baseline, painted top-to-bottom:
    // opaque fills tessellate without seams, the visible band of series k is
    // between boundaries k and k+1
    const layers = series
      .map((s, k) => {
        const top = boundaries[k + 1].map((v, i) => ({ x: sx(i), y: sy(v) }))
        const d = `${basisPath(top)}L${r2(sx(n - 1))},${r2(sy(0))}L${r2(sx(0))},${r2(sy(0))}Z`
        return { d, color: s.color, label: s.label }
      })
      .reverse()
    // The B-spline at data point i passes through (v[i-1]+4v[i]+v[i+1])/6 —
    // for a uniform grid that is exactly x=sx(i): the hover dot sits on the curve
    const smoothedTotal = (i: number) =>
      i === 0 || i === n - 1 ? totals[i] : (totals[i - 1] + 4 * totals[i] + totals[i + 1]) / 6
    return { plotW, plotH, yMax, yTicks, sx, sy, layers, smoothedTotal }
  }, [days.length, series])

  if (days.length < 4 || !series.length) return null
  const { plotW, plotH, yMax, yTicks, sx, sy, layers, smoothedTotal } = geometry

  const xTickEvery = Math.max(1, Math.round(days.length / 6))
  const xTicks = days
    .map((day, index) => ({ day, index }))
    .filter(({ index }) => index % xTickEvery === 0 && index <= days.length - 2)

  const pointerToIndex = (clientX: number): number | null => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    const xInSvg = ((clientX - rect.left) / rect.width) * W
    const ratio = (xInSvg - PAD.left) / plotW
    if (ratio < -0.03 || ratio > 1.03) return null
    return Math.round(Math.min(1, Math.max(0, ratio)) * (days.length - 1))
  }

  // Tooltip: series in stack order (composition), raw values, not smoothed
  const hoverRows =
    hover === null
      ? []
      : series.map((s) => ({ label: s.label, color: s.color, value: s.values[hover] }))
  const hoverLeftPct = hover === null ? 0 : (sx(hover) / W) * 100
  const tooltipOnLeft = hover !== null && hover > days.length * 0.62

  return (
    <div ref={wrapRef} className={entered ? 'vda-enter' : ''}>
      <div
        className="relative"
        onPointerMove={(event) => setHover(pointerToIndex(event.clientX))}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={yLabel}>
          {yTicks.map((tick) =>
            tick === 0 ? null : (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={sy(tick)}
                  x2={W - PAD.right}
                  y2={sy(tick)}
                  stroke={tick === yMax ? 'var(--vz-axis,#C9C9C9)' : 'var(--vz-track,#F0EFED)'}
                  strokeWidth="1"
                  strokeDasharray={tick === yMax ? '5 4' : '2 4'}
                />
                <text
                  x={PAD.left - 10}
                  y={sy(tick) + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="var(--vz-muted,#8A8A8A)"
                >
                  {fmtValue(tick)}
                </text>
              </g>
            )
          )}
          <text
            x={PAD.left - 10}
            y={sy(0) + 4}
            textAnchor="end"
            fontSize="12"
            fill="var(--vz-muted,#8A8A8A)"
          >
            0
          </text>
          {xTicks.map(({ day, index }) => (
            <text
              key={day}
              x={sx(index)}
              y={H - PAD.bottom + 24}
              textAnchor="middle"
              fontSize="12"
              fill="var(--vz-muted,#8A8A8A)"
            >
              {fmtDay(day)}
            </text>
          ))}
          <g className="vda-flow">
            {layers.map((l) => (
              <path key={l.label} d={l.d} fill={l.color} />
            ))}
          </g>
          <line
            x1={PAD.left}
            y1={sy(0)}
            x2={W - PAD.right}
            y2={sy(0)}
            stroke="var(--vz-axis,#D9D9D9)"
            strokeWidth="1"
          />
          {hover !== null ? (
            <g>
              <line
                x1={sx(hover)}
                y1={PAD.top}
                x2={sx(hover)}
                y2={PAD.top + plotH}
                stroke="var(--vz-axis,#C9C9C9)"
                strokeWidth="1"
              />
              <circle
                cx={sx(hover)}
                cy={sy(smoothedTotal(hover))}
                r={4.5}
                fill="var(--vz-ring,#FFFFFF)"
                stroke="var(--vz-ink,#111111)"
                strokeWidth="1.5"
              />
              <circle
                cx={sx(hover)}
                cy={sy(0)}
                r={3.5}
                fill="var(--vz-ring,#FFFFFF)"
                stroke="var(--vz-ink,#111111)"
                strokeWidth="1.5"
              />
            </g>
          ) : null}
        </svg>

        {hover !== null ? (
          <div
            className="pointer-events-none absolute top-6 z-10 min-w-[210px] rounded-[8px] border border-[var(--vz-frame,#E3E3E3)] bg-[var(--vz-surface,#FFFFFF)] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
            style={
              tooltipOnLeft
                ? { right: `${100 - hoverLeftPct}%`, marginRight: 14 }
                : { left: `${hoverLeftPct}%`, marginLeft: 14 }
            }
          >
            <p className="pb-1 text-[13px] font-semibold text-[var(--vz-ink,#111111)]">
              {fmtDayYear(days[hover])}
            </p>
            {hoverRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-5 py-[3px] text-[12.5px]"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-[11px] w-[11px] rounded-[3px]"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="text-[var(--vz-text2,#3D3D3D)]">{row.label}</span>
                </span>
                <span className="font-semibold tabular-nums text-[var(--vz-ink,#111111)]">
                  {row.value === null ? '—' : fmtValue(row.value)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-7 gap-y-2">
        {series.map((s) => (
          <p key={s.label} className="flex items-center gap-2 text-[13px]">
            <span
              className="inline-block h-[10px] w-[10px] rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium text-[var(--vz-text3,#5C5C5C)]">{s.label}</span>
          </p>
        ))}
      </div>

      {/* Dunes rise on entering the viewport; disabled under prefers-reduced-motion */}
      <style>{`
        .vda-flow { opacity: 1; }
        .vda-enter .vda-flow { opacity: 0; transform: translateY(8px); animation: vda-rise 800ms cubic-bezier(0.4, 0, 0.2, 1) 150ms forwards; }
        @keyframes vda-rise { to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .vda-enter .vda-flow { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
