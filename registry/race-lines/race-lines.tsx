'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { seriesColor } from '../../lib/palette'

/**
 * race-lines — multi-series activity line chart ("who is pulling ahead over time?").
 *
 * OpenRouter-genre live chart: date crosshair, date pill, tooltip listing every
 * series sorted by value, dots at intersections, draw-in line animation when
 * the chart scrolls into view. Registry gaps (null values) are bridged with a
 * straight segment so each line stays continuous.
 *
 * Props:
 * - days: string[] — ISO dates ("YYYY-MM-DD"), one per data point (min 8).
 * - series: ActivitySeries[] — { label, values (number|null per day),
 *   color? (defaults to palette seriesColor by index), legendValue?
 *   (e.g. "12.4M/wk"), highlight? (thicker line + bold legend) }.
 * - yLabel?: string — accessible label for the chart.
 */

export type ActivitySeries = {
  label: string
  /** series hue; defaults to seriesColor(index) from the palette */
  color?: string
  values: Array<number | null>
  /** legend annotation, e.g. "12.4M/wk" */
  legendValue?: string
  highlight?: boolean
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDay(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${MONTHS[Number(month) - 1] ?? ''} ${Number(day)}`
}

function compactTick(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return `${Math.round(millions * 10) / 10}M`
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return String(value)
}

const W = 960
const H = 380
const PAD = { top: 18, right: 30, bottom: 40, left: 54 }

export function ActivityLineChart({
  days,
  series,
  yLabel,
}: {
  days: string[]
  series: ActivitySeries[]
  yLabel?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)

  // Draw-in starts when the chart enters the viewport, not on mount: on a
  // long page the animation would otherwise finish before the block scrolls in
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

  const colored = useMemo(
    () => series.map((s, i) => ({ ...s, color: s.color ?? seriesColor(i) })),
    [series]
  )

  const geometry = useMemo(() => {
    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom
    const rawMax = Math.max(
      ...series.flatMap((s) => s.values.filter((v): v is number => v !== null)),
      1
    )
    // Clean ticks: 1-2-2.5-5 × 10^k step targeting 4-5 divisions, top is a multiple of the step
    const stepMag = 10 ** Math.floor(Math.log10(rawMax / 4))
    const yStep =
      [1, 2, 2.5, 5, 10].map((m) => m * stepMag).find((m) => m * 5 >= rawMax) ?? rawMax / 4
    const yMax = yStep * Math.ceil(rawMax / yStep)
    const yTicks = Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, i) => i * yStep)
    const sx = (index: number) => PAD.left + (index / (days.length - 1)) * plotW
    const sy = (value: number) => PAD.top + (1 - value / yMax) * plotH

    // Data gaps (null) are bridged with a straight segment between neighbors:
    // a continuous line reads better than breaks; gaps get no dots
    const bridged = (values: Array<number | null>) =>
      values
        .map((value, index) => (value === null ? null : { index, value }))
        .filter((point): point is { index: number; value: number } => point !== null)
    const linePath = (values: Array<number | null>): string =>
      bridged(values)
        .map((p, i) => `${i ? 'L' : 'M'}${sx(p.index).toFixed(1)},${sy(p.value).toFixed(1)}`)
        .join('')
    const areaPath = (values: Array<number | null>): string => {
      const points = bridged(values)
      if (points.length < 2) return ''
      const line = points
        .map((p, i) => `${i ? 'L' : 'M'}${sx(p.index).toFixed(1)},${sy(p.value).toFixed(1)}`)
        .join('')
      const first = points[0]
      const last = points[points.length - 1]
      return `${line}L${sx(last.index).toFixed(1)},${sy(0).toFixed(1)}L${sx(first.index).toFixed(1)},${sy(0).toFixed(1)}Z`
    }
    const lastPoint = (values: Array<number | null>) => {
      for (let index = values.length - 1; index >= 0; index--) {
        const value = values[index]
        if (value !== null) return { index, value }
      }
      return null
    }
    return { plotW, plotH, yMax, yTicks, sx, sy, linePath, areaPath, lastPoint }
  }, [days.length, series])

  if (days.length < 8 || !series.length) return null
  const { plotW, plotH, yTicks, sx, sy, linePath, areaPath, lastPoint } = geometry

  const xTickEvery = Math.max(1, Math.round(days.length / 5))
  const xTicks = days
    .map((day, index) => ({ day, index }))
    .filter(({ index }) => index % xTickEvery === 0 && index <= days.length - 3)

  const pointerToIndex = (clientX: number): number | null => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    const xInSvg = ((clientX - rect.left) / rect.width) * W
    const ratio = (xInSvg - PAD.left) / plotW
    if (ratio < -0.03 || ratio > 1.03) return null
    const index = Math.round(Math.min(1, Math.max(0, ratio)) * (days.length - 1))
    return index
  }

  // Tooltip: every series sorted by value (OpenRouter genre), gaps sink to the bottom
  const hoverRows =
    hover === null
      ? []
      : colored
          .map((s) => ({ label: s.label, color: s.color, value: s.values[hover] }))
          .sort((a, b) => (b.value ?? -1) - (a.value ?? -1))
  const hoverLeftPct = hover === null ? 0 : (sx(hover) / W) * 100
  const tooltipOnLeft = hover !== null && hover > days.length * 0.62

  return (
    <div className={entered ? 'vca-enter' : ''}>
      <div
        ref={wrapRef}
        className="relative"
        onPointerMove={(event) => setHover(pointerToIndex(event.clientX))}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={yLabel}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={sy(tick)}
                x2={W - PAD.right}
                y2={sy(tick)}
                stroke="var(--vz-track,#f5f5f4)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={sy(tick) + 4}
                textAnchor="end"
                fontSize="12"
                fill="var(--vz-muted,#8a8a8a)"
              >
                {compactTick(tick)}
              </text>
            </g>
          ))}
          {xTicks.map(({ day, index }) => (
            <text
              key={day}
              x={sx(index)}
              y={H - PAD.bottom + 24}
              textAnchor="middle"
              fontSize="12"
              fill="var(--vz-muted,#8a8a8a)"
            >
              {formatDay(day)}
            </text>
          ))}
          <line
            x1={PAD.left}
            y1={sy(0)}
            x2={W - PAD.right}
            y2={sy(0)}
            stroke="var(--vz-axis,#d9d9d9)"
            strokeWidth="1"
          />
          {colored.map((s, i) => (
            <path
              key={`${s.label}-area`}
              d={areaPath(s.values)}
              fill={s.color}
              className="vca-area"
              style={{ animationDelay: `${300 + i * 150}ms` }}
            />
          ))}
          {colored.map((s, i) => (
            <path
              key={`${s.label}-line`}
              d={linePath(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.highlight ? 2.5 : 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              className="vca-line"
              style={{ animationDelay: `${i * 150}ms`, color: s.color }}
            />
          ))}
          {/* Crosshair + intersection dots (hover) */}
          {hover !== null ? (
            <g>
              <line
                x1={sx(hover)}
                y1={PAD.top}
                x2={sx(hover)}
                y2={PAD.top + plotH}
                stroke="var(--vz-axis,#d9d9d9)"
                strokeWidth="1"
              />
              {colored.map((s) => {
                const value = s.values[hover]
                if (value === null) return null
                return (
                  <circle
                    key={`${s.label}-hover`}
                    cx={sx(hover)}
                    cy={sy(value)}
                    r={4.5}
                    fill={s.color}
                    stroke="var(--vz-ring,#ffffff)"
                    strokeWidth="2"
                  />
                )
              })}
            </g>
          ) : (
            colored.map((s) => {
              const end = lastPoint(s.values)
              if (!end) return null
              return (
                <circle
                  key={`${s.label}-dot`}
                  cx={sx(end.index)}
                  cy={sy(end.value)}
                  r={5}
                  fill={s.color}
                  stroke="var(--vz-ring,#ffffff)"
                  strokeWidth="2"
                  className="vca-dot"
                />
              )
            })
          )}
        </svg>

        {hover !== null ? (
          <>
            {/* Date pill at the top of the crosshair */}
            <div
              className="pointer-events-none absolute -top-1 -translate-x-1/2 rounded-full bg-[var(--vz-chip,#111111)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--vz-chip-ink,#ffffff)]"
              style={{ left: `${hoverLeftPct}%` }}
            >
              {formatDay(days[hover])}
            </div>
            {/* Tooltip: series sorted by value */}
            <div
              className="pointer-events-none absolute top-8 z-10 min-w-[190px] border border-[var(--vz-frame,#e3e3e3)] bg-[var(--vz-surface,#ffffff)] px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
              style={
                tooltipOnLeft
                  ? { right: `${100 - hoverLeftPct}%`, marginRight: 14 }
                  : { left: `${hoverLeftPct}%`, marginLeft: 14 }
              }
            >
              {hoverRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-5 py-[3px] text-[12.5px]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-[13px] w-[3.5px] rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="text-[var(--vz-text2,#3a3a3a)]">{row.label}</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {row.value === null ? '—' : compactTick(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        {colored.map((s) => (
          <p key={s.label} className="flex items-center gap-2.5 text-[13px]">
            <span
              className="inline-block h-[10px] w-[10px] rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span
              className={
                s.highlight ? 'font-bold' : 'font-medium text-[var(--vz-text3,#5c5c5c)]'
              }
            >
              {s.label}
            </span>
            {s.legendValue ? (
              <span className="font-semibold tabular-nums text-[var(--vz-ink,#111111)]">
                {s.legendValue}
              </span>
            ) : null}
          </p>
        ))}
      </div>

      {/* Draw-in animations; disabled under prefers-reduced-motion */}
      <style>{`
        .vca-enter .vca-line { stroke-dasharray: 1; stroke-dashoffset: 1; animation: vca-draw 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .vca-enter .vca-area { opacity: 0; animation: vca-fade 700ms ease-out forwards; }
        .vca-enter .vca-dot { opacity: 0; animation: vca-fade 400ms ease-out 1100ms forwards; }
        @keyframes vca-draw { to { stroke-dashoffset: 0; } }
        @keyframes vca-fade { to { opacity: 1; } }
        .vca-area { fill-opacity: 0.08; }
        @media (prefers-reduced-motion: reduce) {
          .vca-line, .vca-area, .vca-dot { animation: none; stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
