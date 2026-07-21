import { seriesColor } from '../../lib/palette'

/**
 * BubbleField — a two-axis pool scatter with size and category encodings.
 *
 * Answers "how is the pool scattered across two axes?" in 2 seconds: every
 * entity is positioned by two quantitative values, bubble area carries size,
 * and color carries category. Either axis can use log10 scaling; log axes draw
 * decade gridlines. Category counts are derived into the legend, and native
 * SVG titles expose the four values on hover. SVG geometry only; serializable
 * props and no client runtime.
 *
 * Props:
 * - points: {x, y, size, category, label?}[].
 * - categories: {key, label, color?}[]; colors default to seriesColor(index).
 * - xLabel / yLabel: axis captions.
 * - xLog? / yLog?: use log10 scaling on that axis (default false).
 * - width? / height?: SVG viewBox dimensions (default 900 × 500).
 */

const MONO = 'ui-monospace, SFMono-Regular, monospace'
const PAD = { top: 20, right: 24, bottom: 62, left: 76 }

export type BubbleFieldPoint = {
  x: number
  y: number
  size: number
  category: string
  label?: string
}

export type BubbleFieldCategory = {
  key: string
  label: string
  color?: string
}

type Scale = {
  ticks: number[]
  position: (value: number) => number
}

function decadeTicks(values: number[]): { min: number; max: number; ticks: number[] } {
  const positive = values.filter((value) => value > 0)
  const minPower = Math.floor(Math.log10(Math.min(...positive)))
  const maxPower = Math.ceil(Math.log10(Math.max(...positive)))
  const ticks = Array.from({ length: maxPower - minPower + 1 }, (_, index) => 10 ** (minPower + index))
  return { min: 10 ** minPower, max: 10 ** maxPower, ticks }
}

function linearTicks(values: number[]): { min: number; max: number; ticks: number[] } {
  const maxValue = Math.max(...values, 1)
  const magnitude = 10 ** Math.floor(Math.log10(maxValue))
  const normalized = maxValue / magnitude
  const niceMax = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
  return { min: 0, max: niceMax, ticks: [0, niceMax / 4, niceMax / 2, (niceMax * 3) / 4, niceMax] }
}

function makeScale(values: number[], log: boolean, start: number, end: number): Scale {
  const domain = log ? decadeTicks(values) : linearTicks(values)
  const minValue = log ? Math.log10(domain.min) : domain.min
  const maxValue = log ? Math.log10(domain.max) : domain.max
  const span = maxValue - minValue || 1
  return {
    ticks: domain.ticks,
    position: (value) => {
      const normalizedValue = log ? Math.log10(value) : value
      return start + ((normalizedValue - minValue) / span) * (end - start)
    },
  }
}

function formatTick(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}m`
  if (value >= 1_000) return `${value / 1_000}k`
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function BubbleField({
  points,
  categories,
  xLabel,
  yLabel,
  xLog = false,
  yLog = false,
  width = 900,
  height = 500,
}: {
  points: BubbleFieldPoint[]
  categories: BubbleFieldCategory[]
  xLabel: string
  yLabel: string
  xLog?: boolean
  yLog?: boolean
  width?: number
  height?: number
}) {
  const chartWidth = Math.max(width, 520)
  const chartHeight = Math.max(height, 320)
  const plotRight = chartWidth - PAD.right
  const plotBottom = chartHeight - PAD.bottom
  const validPoints = points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y) && (!xLog || point.x > 0) && (!yLog || point.y > 0),
  )
  if (!validPoints.length) return null

  const xScale = makeScale(
    validPoints.map((point) => point.x),
    xLog,
    PAD.left,
    plotRight,
  )
  const yScale = makeScale(
    validPoints.map((point) => point.y),
    yLog,
    plotBottom,
    PAD.top,
  )
  const sizes = validPoints.map((point) => Math.max(point.size, 0))
  const minSize = Math.min(...sizes)
  const maxSize = Math.max(...sizes)
  const radius = (size: number) => {
    if (maxSize === minSize) return 8.5
    const normalized = (Math.sqrt(Math.max(size, 0)) - Math.sqrt(minSize)) / (Math.sqrt(maxSize) - Math.sqrt(minSize))
    return 3 + normalized * 11
  }
  const colorByCategory = new Map(
    categories.map((category, index) => [category.key, category.color ?? seriesColor(index)]),
  )

  return (
    <div className="border-y border-[var(--vz-ink,#111111)] py-4 text-[var(--vz-ink,#111111)] [font-variant-numeric:tabular-nums]">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        role="img"
        aria-label={`${xLabel} by ${yLabel} bubble field`}
      >
        {xScale.ticks.map((tick) => {
          const x = Number(xScale.position(tick).toFixed(2))
          return (
            <g key={`x-${tick}`}>
              <line
                x1={x}
                y1={PAD.top}
                x2={x}
                y2={plotBottom}
                stroke="var(--vz-grid,#e3e3e3)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={plotBottom + 20}
                textAnchor="middle"
                fontFamily={MONO}
                fontSize="9.5"
                fill="var(--vz-muted,#8a8a8a)"
              >
                {formatTick(tick)}
              </text>
            </g>
          )
        })}
        {yScale.ticks.map((tick) => {
          const y = Number(yScale.position(tick).toFixed(2))
          return (
            <g key={`y-${tick}`}>
              <line
                x1={PAD.left}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke="var(--vz-grid,#e3e3e3)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={y + 3.5}
                textAnchor="end"
                fontFamily={MONO}
                fontSize="9.5"
                fill="var(--vz-muted,#8a8a8a)"
              >
                {formatTick(tick)}
              </text>
            </g>
          )
        })}

        <line
          x1={PAD.left}
          y1={plotBottom}
          x2={plotRight}
          y2={plotBottom}
          stroke="var(--vz-ink,#111111)"
          strokeWidth="1"
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={plotBottom}
          stroke="var(--vz-ink,#111111)"
          strokeWidth="1"
        />

        {validPoints.map((point, index) => {
          const color = colorByCategory.get(point.category) ?? seriesColor(categories.length + index)
          return (
            <circle
              key={`${point.label ?? point.category}-${point.x}-${point.y}-${index}`}
              cx={xScale.position(point.x).toFixed(2)}
              cy={yScale.position(point.y).toFixed(2)}
              r={radius(point.size).toFixed(2)}
              fill={color}
              fillOpacity="0.75"
              stroke={color}
              strokeWidth="1"
            >
              <title>{`${point.label ?? point.category} · ${point.x} · ${point.y} · ${point.size}`}</title>
            </circle>
          )
        })}

        <text
          x={(PAD.left + plotRight) / 2}
          y={chartHeight - 12}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="10"
          letterSpacing="0.6"
          fill="var(--vz-muted,#8a8a8a)"
        >
          {xLabel.toUpperCase()}
        </text>
        <text
          x="15"
          y={(PAD.top + plotBottom) / 2}
          transform={`rotate(-90 15 ${(PAD.top + plotBottom) / 2})`}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="10"
          letterSpacing="0.6"
          fill="var(--vz-muted,#8a8a8a)"
        >
          {yLabel.toUpperCase()}
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1">
        {categories.map((category, index) => {
          const color = category.color ?? seriesColor(index)
          const count = validPoints.filter((point) => point.category === category.key).length
          return (
            <div
              key={category.key}
              className="flex items-center gap-1.5 text-[10px]"
              style={{ fontFamily: MONO }}
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full border"
                style={{ backgroundColor: color, borderColor: color, opacity: 0.75 }}
              />
              <span className="font-semibold">{category.label}</span>
              <span className="text-[var(--vz-muted,#8a8a8a)]">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
