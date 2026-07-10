'use client'

/**
 * DeltaBars — diverging daily delta ribbon for a PAIR of rivals.
 *
 * Answers "who is ahead today, and by how much?": for each day it draws one
 * bar of the daily difference (a − b) from a zero midline — up in A's color
 * when A leads, down in B's color when B leads. The eye reads streaks and
 * flips of the lead instantly; symmetric ±max scale computed from the data.
 * Client component only for the entrance animation: an IntersectionObserver
 * fires a time-based staggered grow when the chart scrolls into view.
 *
 * Props:
 * - a, b: DeltaSeries — the two rivals: { label, values (number|null per
 *   day, null = missing day, no bar), color? (defaults to seriesColor(0)
 *   and seriesColor(1)) }.
 * - xLabels?: { frac (0..1 across the plot), text }[] — x-axis captions.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { seriesColor } from '../../lib/palette'

export type DeltaSeries = {
  label: string
  /** series hue; defaults to seriesColor(0) for a, seriesColor(1) for b */
  color?: string
  values: Array<number | null>
}

const MUT = 'var(--vz-muted,#8A8A8A)'
const W = 720
const H = 240
const PAD = { t: 12, r: 16, b: 26, l: 44 }

/** Clean axis ceiling: 1-2-2.5-5 × 10^k step targeting ~4-5 divisions. */
function niceMax(raw: number): { max: number; step: number } {
  const mag = 10 ** Math.floor(Math.log10(raw / 4))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((m) => m * 5 >= raw) ?? raw / 4
  return { max: step * Math.ceil(raw / step), step }
}

function fmt(v: number): string {
  if (v >= 1_000_000) return `${Math.round(v / 100_000) / 10}M`
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`
  return String(Math.round(v))
}

export function DeltaBars({
  a,
  b,
  xLabels,
}: {
  a: DeltaSeries
  b: DeltaSeries
  xLabels?: Array<{ frac: number; text: string }>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
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

  const colorA = a.color ?? seriesColor(0)
  const colorB = b.color ?? seriesColor(1)
  const n = a.values.length
  const delta = Array.from({ length: n }, (_, i) =>
    a.values[i] !== null && b.values[i] !== null
      ? (a.values[i] as number) - (b.values[i] as number)
      : null
  )
  const absMax = Math.max(...delta.map((d) => Math.abs(d ?? 0)), 1)
  const { max } = niceMax(absMax)
  const mid = H / 2
  const plotW = W - PAD.l - PAD.r
  const barW = Math.max(2, plotW / n - 2)
  return (
    <div ref={wrapRef} className={entered ? 'vdb-in' : ''}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={mid}
          y2={mid}
          stroke="var(--vz-axis,#D9D9D9)"
          strokeWidth="1"
        />
        <text x={PAD.l - 8} y={16} textAnchor="end" fontSize="11" fill={MUT}>
          +{fmt(max)}
        </text>
        <text x={PAD.l - 8} y={H - 22} textAnchor="end" fontSize="11" fill={MUT}>
          −{fmt(max)}
        </text>
        {delta.map((d, i) => {
          if (d === null) return null
          const hh = (Math.abs(d) / max) * (mid - 24)
          return (
            <rect
              key={i}
              className={d >= 0 ? 'vdb-bar vdb-up' : 'vdb-bar vdb-down'}
              style={{ '--i': i } as CSSProperties}
              x={PAD.l + (i / n) * plotW}
              y={d >= 0 ? mid - hh : mid}
              width={barW}
              height={Math.max(1.5, hh)}
              rx="2"
              fill={d >= 0 ? colorA : colorB}
            >
              <title>{`${d >= 0 ? a.label : b.label} ahead by ${fmt(Math.abs(d))}`}</title>
            </rect>
          )
        })}
        {xLabels?.map((l) => (
          <text
            key={l.text}
            x={PAD.l + l.frac * plotW}
            y={H - 6}
            textAnchor="middle"
            fontSize="11"
            fill={MUT}
          >
            {l.text}
          </text>
        ))}
        <text
          className="vdb-legend"
          x={W - PAD.r}
          y={16}
          textAnchor="end"
          fontSize="11.5"
          fontWeight="650"
          fill={colorA}
        >
          ▲ {a.label} ahead
        </text>
        <text
          className="vdb-legend"
          x={W - PAD.r}
          y={H - 22}
          textAnchor="end"
          fontSize="11.5"
          fontWeight="650"
          fill={colorB}
        >
          ▼ {b.label} ahead
        </text>
      </svg>

      {/* Bars grow from the zero midline on viewport entry (up-bars from the
          bottom edge, down-bars from the top edge); legends fade in.
          Disabled under prefers-reduced-motion. */}
      <style>{`
        .vdb-bar { transform-box: fill-box; }
        .vdb-in .vdb-up { transform-origin: 50% 100%; animation: vdb-grow 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) calc(var(--i) * 35ms) both; }
        .vdb-in .vdb-down { transform-origin: 50% 0%; animation: vdb-grow 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) calc(var(--i) * 35ms) both; }
        .vdb-in .vdb-legend { animation: vdb-fade 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) 250ms both; }
        @keyframes vdb-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes vdb-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .vdb-in .vdb-up, .vdb-in .vdb-down, .vdb-in .vdb-legend { animation: none; transform: none; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
