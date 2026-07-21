import { seriesColor } from '../../lib/palette'

/**
 * RankSlope — a two-context slopegraph for reading reordering and spread.
 *
 * Answers "how does the ranking reorder between two contexts?" in 2 seconds:
 * every item connects one value on the left axis to one value on the right,
 * so crossings carry the story. Both axes share one linear scale. Labels are
 * nudged independently on each side with a deterministic greedy pass while
 * short leader lines preserve their connection to the true value position.
 * SVG geometry only; serializable props and no client runtime.
 *
 * Props:
 * - left / right: the two context labels shown above the axes.
 * - items: {label, from, to, color?}[]; color defaults to seriesColor(index).
 * - unit?: suffix appended to values (default "%").
 * - height?: SVG viewBox height (default 360; grows to preserve label gaps).
 */

const MONO = 'ui-monospace, SFMono-Regular, monospace'
const W = 920
const AXIS_LEFT = 310
const AXIS_RIGHT = 610
const PAD = { top: 50, bottom: 26 }
const LABEL_GAP = 14

export type RankSlopeItem = {
  label: string
  from: number
  to: number
  color?: string
}

function declutter(entries: { index: number; rawY: number }[], top: number, bottom: number) {
  const sorted = [...entries].sort((a, b) => a.rawY - b.rawY || a.index - b.index)
  const placed = sorted.map((entry, index) => ({
    ...entry,
    y: Math.max(entry.rawY, index === 0 ? top : top),
  }))

  for (let index = 1; index < placed.length; index++) {
    placed[index].y = Math.max(placed[index].rawY, placed[index - 1].y + LABEL_GAP)
  }
  if (placed.at(-1)?.y && placed.at(-1)!.y > bottom) {
    placed[placed.length - 1].y = bottom
    for (let index = placed.length - 2; index >= 0; index--) {
      placed[index].y = Math.min(placed[index].y, placed[index + 1].y - LABEL_GAP)
    }
  }

  return new Map(placed.map((entry) => [entry.index, entry.y]))
}

export function RankSlope({
  left,
  right,
  items,
  unit = '%',
  height = 360,
}: {
  left: string
  right: string
  items: RankSlopeItem[]
  unit?: string
  height?: number
}) {
  if (!items.length) return null

  const chartHeight = Math.max(height, PAD.top + PAD.bottom + (items.length - 1) * LABEL_GAP)
  const plotBottom = chartHeight - PAD.bottom
  const values = items.flatMap((item) => [item.from, item.to])
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const span = rawMax - rawMin || 1
  const scaleY = (value: number) => PAD.top + ((rawMax - value) / span) * (plotBottom - PAD.top)
  const fromPositions = declutter(
    items.map((item, index) => ({ index, rawY: scaleY(item.from) })),
    PAD.top,
    plotBottom,
  )
  const toPositions = declutter(
    items.map((item, index) => ({ index, rawY: scaleY(item.to) })),
    PAD.top,
    plotBottom,
  )
  const formatValue = (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`

  return (
    <div className="overflow-x-auto border-y border-[var(--vz-ink,#111111)] py-4 text-[var(--vz-ink,#111111)] [font-variant-numeric:tabular-nums]">
      <svg
        viewBox={`0 0 ${W} ${chartHeight}`}
        className="min-w-[680px] w-full"
        role="img"
        aria-label={`${left} to ${right} ranking slopegraph`}
      >
        <text
          x={AXIS_LEFT}
          y="14"
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="10"
          letterSpacing="1.1"
          fill="var(--vz-muted,#8a8a8a)"
        >
          {left.toUpperCase()}
        </text>
        <text
          x={AXIS_RIGHT}
          y="14"
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="10"
          letterSpacing="1.1"
          fill="var(--vz-muted,#8a8a8a)"
        >
          {right.toUpperCase()}
        </text>

        <line
          x1={AXIS_LEFT}
          y1={PAD.top - 10}
          x2={AXIS_LEFT}
          y2={plotBottom + 8}
          stroke="var(--vz-ink,#111111)"
          strokeWidth="1"
        />
        <line
          x1={AXIS_RIGHT}
          y1={PAD.top - 10}
          x2={AXIS_RIGHT}
          y2={plotBottom + 8}
          stroke="var(--vz-ink,#111111)"
          strokeWidth="1"
        />

        {items.map((item, index) => {
          const color = item.color ?? seriesColor(index)
          const fromY = scaleY(item.from)
          const toY = scaleY(item.to)
          const fromLabelY = fromPositions.get(index) ?? fromY
          const toLabelY = toPositions.get(index) ?? toY
          return (
            <g key={`${item.label}-${index}`}>
              <title>{`${item.label} · ${formatValue(item.from)} to ${formatValue(item.to)}`}</title>
              <line
                x1={AXIS_LEFT}
                y1={fromY}
                x2={AXIS_RIGHT}
                y2={toY}
                stroke={color}
                strokeWidth="2"
                strokeOpacity="0.9"
              />
              <circle cx={AXIS_LEFT} cy={fromY} r="2.5" fill={color} />
              <circle cx={AXIS_RIGHT} cy={toY} r="2.5" fill={color} />
              <line
                x1={AXIS_LEFT - 7}
                y1={fromLabelY}
                x2={AXIS_LEFT - 1}
                y2={fromY}
                stroke={color}
                strokeWidth="1"
              />
              <line
                x1={AXIS_RIGHT + 1}
                y1={toY}
                x2={AXIS_RIGHT + 7}
                y2={toLabelY}
                stroke={color}
                strokeWidth="1"
              />
              <text
                x={AXIS_LEFT - 12}
                y={fromLabelY + 3.5}
                textAnchor="end"
                fontFamily={MONO}
                fontSize="10.5"
                fill="var(--vz-ink,#111111)"
              >
                {item.label} <tspan fontWeight="700">{formatValue(item.from)}</tspan>
              </text>
              <text
                x={AXIS_RIGHT + 12}
                y={toLabelY + 3.5}
                fontFamily={MONO}
                fontSize="10.5"
                fill="var(--vz-ink,#111111)"
              >
                <tspan fontWeight="700">{formatValue(item.to)}</tspan> {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
