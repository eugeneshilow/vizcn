/**
 * BubbleScatterPlot — bubble scatter on log-log axes.
 *
 * Answers "how do entities spread across two count dimensions, and which
 * are the heavyweights?" in 2 seconds: position = the two counts, bubble
 * area = a third count, color = category. Axes span full decades around
 * the data with 100 / 1k / 10k / 100k-style ticks; each bubble gets a 2px
 * surface ring and an ink label with vertical collision avoidance; a
 * category legend with per-series totals sits below. Pure server
 * component — inline SVG, zero client JS.
 *
 * Props:
 * - points: BubblePoint[] — x, y, size (all counts > 0), label, series,
 *   optional color (default: seriesColor by series first-appearance index).
 * - xLabel / yLabel: string — axis captions.
 * - legendUnit?: string — suffix for tooltip and legend totals (e.g. "repos").
 */
import { seriesColor } from '../../lib/palette'

export type BubblePoint = {
  x: number
  y: number
  /** bubble size in data units (area is proportional to the value) */
  size: number
  label: string
  series: string
  /** custom series color (default: seriesColor by series index) */
  color?: string
}

/**
 * Bubble scatter on log-log axes: dot size = count, color = category,
 * decade ticks (100 / 1k / 10k / 100k), 2px surface ring on each dot,
 * ink point labels, category legend below. Pure SVG, no JS.
 */
export function BubbleScatterPlot({
  points,
  xLabel,
  yLabel,
  legendUnit = '',
}: {
  points: BubblePoint[]
  xLabel: string
  yLabel: string
  legendUnit?: string
}) {
  if (points.length < 2) return null
  const W = 960
  const H = 560
  const PAD = { top: 28, right: 40, bottom: 64, left: 76 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  // Color follows the entity: explicit per-point color wins, otherwise a
  // stable palette hue by the series' first-appearance index.
  const seriesOrder: string[] = []
  for (const p of points) if (!seriesOrder.includes(p.series)) seriesOrder.push(p.series)
  const colorOf = (p: BubblePoint) => p.color ?? seriesColor(seriesOrder.indexOf(p.series))

  const log = Math.log10
  // Domain = full decades around the data (100 / 1k / 10k / 100k-style ticks)
  const domain = (vals: number[]) => {
    const lo = Math.floor(log(Math.min(...vals)) - 0.02)
    const hi = Math.ceil(log(Math.max(...vals)) + 0.02)
    return [lo, hi] as const
  }
  const [x0, x1] = domain(points.map((p) => p.x))
  const [y0, y1] = domain(points.map((p) => p.y))
  const sx = (v: number) => PAD.left + ((log(v) - x0) / (x1 - x0)) * plotW
  const sy = (v: number) => PAD.top + (1 - (log(v) - y0) / (y1 - y0)) * plotH
  const fmtTick = (p: number) =>
    p >= 6 ? `${10 ** (p - 6)}M` : p >= 3 ? `${10 ** (p - 3)}k` : `${10 ** p}`
  const xTicks = Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i)
  const yTicks = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i)

  const sMin = Math.min(...points.map((p) => p.size))
  const radius = (s: number) => 8 * Math.sqrt(s / sMin)

  // Point labels: ink, placed beside the bubble, collisions resolved vertically
  const placed: Array<{ x: number; y: number; w: number }> = []
  const marks = [...points]
    .sort((a, b) => b.y - a.y)
    .map((p) => {
      const cx = sx(p.x)
      const cy = sy(p.y)
      const r = radius(p.size)
      const w = p.label.length * 7
      const anchorEnd = cx + r + 8 + w > W - PAD.right
      const lx = anchorEnd ? cx - r - 8 : cx + r + 8
      let ly = cy + 4
      for (let guard = 0; guard < 6; guard++) {
        const clash = placed.find(
          (q) =>
            Math.abs(q.y - ly) < 15 && Math.abs(q.x - (anchorEnd ? lx - w : lx)) < Math.max(q.w, w)
        )
        if (!clash) break
        ly += 15
      }
      placed.push({ x: anchorEnd ? lx - w : lx, y: ly, w })
      return { ...p, fill: colorOf(p), cx, cy, r, lx, ly, anchorEnd }
    })

  const series = points.reduce<Array<{ name: string; color: string; total: number }>>((acc, p) => {
    const found = acc.find((s) => s.name === p.series)
    if (found) found.total += p.size
    else acc.push({ name: p.series, color: colorOf(p), total: p.size })
    return acc
  }, [])

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`${yLabel} vs ${xLabel}`}
      >
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line
              x1={PAD.left}
              y1={sy(10 ** t)}
              x2={W - PAD.right}
              y2={sy(10 ** t)}
              stroke="var(--vz-grid,#EDEDED)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 10}
              y={sy(10 ** t) + 4}
              textAnchor="end"
              fontSize="12"
              fill="var(--vz-muted2,#9C9C9C)"
            >
              {fmtTick(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line
              x1={sx(10 ** t)}
              y1={PAD.top}
              x2={sx(10 ** t)}
              y2={H - PAD.bottom}
              stroke="var(--vz-grid,#EDEDED)"
              strokeWidth="1"
            />
            <text
              x={sx(10 ** t)}
              y={H - PAD.bottom + 22}
              textAnchor="middle"
              fontSize="12"
              fill="var(--vz-muted2,#9C9C9C)"
            >
              {fmtTick(t)}
            </text>
          </g>
        ))}
        <text
          x={(PAD.left + W - PAD.right) / 2}
          y={H - 12}
          textAnchor="middle"
          fontSize="13"
          fill="var(--vz-text2,#3A3A3A)"
        >
          {xLabel}
        </text>
        <text
          x={18}
          y={(PAD.top + H - PAD.bottom) / 2}
          textAnchor="middle"
          fontSize="13"
          fill="var(--vz-text2,#3A3A3A)"
          transform={`rotate(-90 18 ${(PAD.top + H - PAD.bottom) / 2})`}
        >
          {yLabel}
        </text>
        {marks.map((p) => (
          <g key={p.label} className="vc-mark">
            <circle
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={p.fill}
              stroke="var(--vz-ring,#FFFFFF)"
              strokeWidth="2"
            >
              <title>{`${p.label} · ${p.series} · ${p.size}${legendUnit ? ` ${legendUnit}` : ''}`}</title>
            </circle>
            <text
              x={p.lx}
              y={p.ly}
              textAnchor={p.anchorEnd ? 'end' : 'start'}
              fontSize="12.5"
              fontWeight="600"
              fill="var(--vz-text2,#3A3A3A)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--vz-grid,#EDEDED)] pt-2.5 text-[12.5px] text-[var(--vz-text2,#3A3A3A)]">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-baseline gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 self-center rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-semibold">{s.name}</span>
            <span className="text-[var(--vz-muted2,#9C9C9C)]">
              {s.total}
              {legendUnit ? ` ${legendUnit}` : ''}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
