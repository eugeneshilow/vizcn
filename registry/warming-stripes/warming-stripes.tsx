/**
 * WarmingStripes — a climate-stripes ribbon for eras of intensity over time.
 *
 * Answers in 2 seconds: "when was this field hot, and when was it cold?"
 * Each year is one vertical stripe; contiguous eras share a heat level
 * (0 = coldest … 3 = hottest), painted from a sequential ramp. Axis ticks
 * are computed from the [from, to] range; labeled eras become a legend.
 *
 * Props:
 * - from / to    — inclusive year range of the ribbon
 * - eras         — periods { start, end, heat: 0|1|2|3, label? }; years not
 *                  covered by any era default to heat 1
 * - note         — optional caption under the legend
 * - colors       — optional 4-color ramp override (index = heat level);
 *                  defaults to the palette's sequential HEAT ramp
 *
 * Pure server component (no hooks). Renders fine without motion.css;
 * with it, the ribbon reveals on scroll (vc-reveal).
 */
import { HEAT } from '../../lib/palette'

/** Default heat ramp: 4 steps from the sequential palette, light → dark. */
const DEFAULT_COLORS: [string, string, string, string] = [
  HEAT[0],
  HEAT[1],
  HEAT[3],
  HEAT[4],
]

/**
 * Axis ticks for a year range: endpoints plus round-numbered inner ticks
 * (step chosen so there are at most ~5 inner intervals), dropping inner
 * ticks that would crowd the endpoint labels.
 */
function ticksFor(from: number, to: number): number[] {
  const span = to - from
  if (span <= 0) return [from]
  const step =
    [1, 2, 5, 10, 20, 25, 50, 100].find((s) => span / s <= 5) ?? Math.ceil(span / 5)
  const pad = span * 0.04
  const inner: number[] = []
  for (let t = Math.ceil(from / step) * step; t < to; t += step) {
    if (t - from > pad && to - t > pad) inner.push(t)
  }
  return [from, ...inner, to]
}

export function WarmingStripes({
  from,
  to,
  eras,
  note,
  colors = DEFAULT_COLORS,
}: {
  from: number
  to: number
  /** era periods; heat 0..3: cold → neutral → warm → hot */
  eras: Array<{ start: number; end: number; heat: 0 | 1 | 2 | 3; label?: string }>
  note?: string
  /** 4-color ramp, index = heat level (defaults to palette HEAT) */
  colors?: [string, string, string, string]
}) {
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const heatFor = (year: number) => eras.find((e) => year >= e.start && year <= e.end)?.heat ?? 1
  return (
    <div className="vc-reveal max-w-[760px]">
      <div className="flex h-[72px] overflow-hidden rounded">
        {years.map((year) => (
          <div
            key={year}
            className="h-full flex-1"
            style={{ backgroundColor: colors[heatFor(year)] }}
          >
            <span className="sr-only">{year}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-1 h-[16px] text-[10.5px] text-[var(--vz-muted,#8a8a8a)]">
        {ticksFor(from, to).map((year) => (
          <span
            key={year}
            className="absolute -translate-x-1/2"
            style={{ left: `${((year - from) / (to - from)) * 100}%` }}
          >
            {year}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[var(--vz-text3,#5c5c5c)]">
        {eras
          .filter((e) => e.label)
          .map((e) => (
            <span key={e.label} className="flex items-center gap-1.5">
              <span
                className="h-[9px] w-[9px] rounded-[2px]"
                style={{ backgroundColor: colors[e.heat] }}
              />
              {e.label}
            </span>
          ))}
      </div>
      {note ? (
        <p className="mt-2 text-[11px] leading-5 text-[var(--vz-muted,#8a8a8a)]">{note}</p>
      ) : null}
    </div>
  )
}
