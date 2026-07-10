/**
 * BubbleField — log-log bubble scatter.
 *
 * Answers: "how do entities spread across two orders-of-magnitude axes, and
 * how big is each?" X and Y sit on log10 axes with decade ticks
 * (100 / 1k / 10k / 100k), bubble area encodes `size`, color encodes the
 * categorical `series`, point labels are placed beside each bubble with a
 * simple vertical-collision spread, and a category legend sits below.
 *
 * Pure SVG, no hooks — a server component (props → SVG). Structural colors
 * read from theme.css `--vz-*` vars with hex fallbacks. Series colors come
 * in on each point's `color` (hand it `seriesColor(i)` / `CATEGORICAL`).
 *
 * Props:
 *   points      BubblePoint[]  — {x, y, size, label, series, color}, ≥2
 *   xLabel      string         — x-axis caption
 *   yLabel      string         — y-axis caption
 *   legendUnit  string         — unit suffix for size in tooltip + legend
 */

export type BubblePoint = {
  x: number
  y: number
  /** размер пузыря в единицах данных (площадь ∝ значению) */
  size: number
  label: string
  series: string
  color: string
}

export function BubbleField({
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

  const log = Math.log10
  // Домен - полные декады вокруг данных (тики 100 / 1k / 10k / 100k, как в жанре)
  const domain = (vals: number[]) => {
    const lo = Math.floor(log(Math.min(...vals)) - 0.02)
    const hi = Math.ceil(log(Math.max(...vals)) + 0.02)
    return [lo, hi] as const
  }
  const [x0, x1] = domain(points.map((p) => p.x))
  const [y0, y1] = domain(points.map((p) => p.y))
  const sx = (v: number) => PAD.left + ((log(v) - x0) / (x1 - x0)) * plotW
  const sy = (v: number) => PAD.top + (1 - (log(v) - y0) / (y1 - y0)) * plotH
  const fmtTick = (p: number) => (p >= 3 ? `${10 ** (p - 3)}k` : `${10 ** p}`)
  const xTicks = Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i)
  const yTicks = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i)

  const sMin = Math.min(...points.map((p) => p.size))
  const radius = (s: number) => 8 * Math.sqrt(s / sMin)

  // Подписи точек: чернилами, вбок от пузыря, с разводом коллизий по вертикали
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
      return { ...p, cx, cy, r, lx, ly, anchorEnd }
    })

  const series = points.reduce<Array<{ name: string; color: string; total: number }>>((acc, p) => {
    const found = acc.find((s) => s.name === p.series)
    if (found) found.total += p.size
    else acc.push({ name: p.series, color: p.color, total: p.size })
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
              stroke="var(--vz-track,#ECECEC)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 10}
              y={sy(10 ** t) + 4}
              textAnchor="end"
              fontSize="12"
              fill="var(--vz-muted2,#767676)"
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
              stroke="var(--vz-track,#ECECEC)"
              strokeWidth="1"
            />
            <text
              x={sx(10 ** t)}
              y={H - PAD.bottom + 22}
              textAnchor="middle"
              fontSize="12"
              fill="var(--vz-muted2,#767676)"
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
          fill="var(--vz-text2,#3D3D3D)"
        >
          {xLabel}
        </text>
        <text
          x={18}
          y={(PAD.top + H - PAD.bottom) / 2}
          textAnchor="middle"
          fontSize="13"
          fill="var(--vz-text2,#3D3D3D)"
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
              fill={p.color}
              stroke="var(--vz-surface,#FFFFFF)"
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
              fill="var(--vz-text2,#3D3D3D)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--vz-track,#ECECEC)] pt-2.5 text-[12.5px] text-[var(--vz-text2,#3D3D3D)]">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-baseline gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 self-center rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-semibold">{s.name}</span>
            <span className="text-[var(--vz-muted2,#767676)]">
              {s.total}
              {legendUnit ? ` ${legendUnit}` : ''}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
