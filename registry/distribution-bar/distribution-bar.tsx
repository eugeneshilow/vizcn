/**
 * DistributionBar — a single proportional composition bar.
 *
 * Answers: "how does one total break down across a handful of categories?"
 * Renders a full-width stacked bar whose segments are sized by value
 * (flex-grow ∝ value), with in-segment labels where they fit (share ≥ 14%)
 * and a "swatch · label · value (share%)" legend below. 2px gaps show the
 * surface through; no strokes. Pure props → SVG-free div/flex, no hooks (RSC).
 *
 * Props:
 *   segments: { label, value, color }[] — one entry per category; `color` is
 *             the fill (pass an explicit hue, or seriesColor(i) from ./palette).
 *   unit?:    string appended to values in tooltips (e.g. "GB", "req").
 */

export type DistributionSegment = { label: string; value: number; color: string }

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
        {segments.map((s) => {
          const share = s.value / total
          return (
            <div
              key={s.label}
              className="flex min-w-0 items-center justify-center"
              style={{ flexGrow: s.value, flexBasis: 0, backgroundColor: s.color }}
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
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-[var(--vz-text2,#3D3D3D)]">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-baseline gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 self-center rounded-[2px]"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-semibold">{s.label}</span>
            <span className="text-[var(--vz-muted2,#767676)]">
              {s.value} ({Math.round((s.value / total) * 100)}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
