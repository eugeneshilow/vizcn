import { seriesColor } from '../../lib/palette'

export type DistributionSegment = {
  label: string
  value: number
  /** Segment fill; defaults to seriesColor(index) when omitted. */
  color?: string
}

/**
 * DistributionBar — answers "how does the whole split into parts?"
 *
 * A proportional stacked strip (the "language distribution" genre): one
 * horizontal bar where each segment's width is its share of the total,
 * labels rendered inside segments that are wide enough (>= 14% share),
 * and a "label · N (share%)" legend below. 2px gaps read as the surface
 * showing through; no strokes.
 *
 * Props:
 * - segments: { label, value, color? }[] — parts of the whole; color falls
 *   back to the categorical palette by index.
 * - unit?: string — appended to values in tooltips (e.g. "tasks").
 *
 * Server-safe: pure props → markup, no hooks or handlers.
 */
export function DistributionBar({
  segments,
  unit = '',
}: {
  segments: DistributionSegment[]
  unit?: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total <= 0) return null
  return (
    <div>
      <div className="flex h-9 w-full gap-[2px]">
        {segments.map((s, i) => {
          const share = s.value / total
          const color = s.color ?? seriesColor(i)
          return (
            <div
              key={s.label}
              className="flex min-w-0 items-center justify-center"
              style={{ flexGrow: s.value, flexBasis: 0, backgroundColor: color }}
              title={`${s.label} · ${s.value}${unit ? ` ${unit}` : ''} (${Math.round(share * 100)}%)`}
            >
              {share >= 0.14 ? (
                <span className="truncate px-2 text-[12.5px] font-semibold text-white">
                  {s.label} {s.value}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-[var(--vz-text2,#3a3a3a)]">
        {segments.map((s, i) => (
          <span key={s.label} className="inline-flex items-baseline gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 self-center rounded-[2px]"
              style={{ backgroundColor: s.color ?? seriesColor(i) }}
            />
            <span className="font-semibold">{s.label}</span>
            <span className="text-[var(--vz-muted2,#9c9c9c)]">
              {s.value} ({Math.round((s.value / total) * 100)}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
