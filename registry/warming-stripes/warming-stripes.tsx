/**
 * WarmingStripes — a "warming stripes" ribbon: one vertical stripe per year,
 * colored by an ordinal heat level so a long span reads as cold spells and
 * hot spells at a glance. Answers: "when were the cold winters and the hot
 * peaks across this range?"
 *
 * Pure props → SVG-free inline layout (flex stripes), no hooks → React Server
 * Component. Structural colors read from --vz-* tokens (theme.css); the heat
 * ramp is a neutral cold→hot diverging scale from the categorical palette.
 *
 * Props:
 *   from  — first year (inclusive)
 *   to    — last year (inclusive)
 *   eras  — periods with a heat level 0..3 (winter → neutral → warm → hot);
 *           optional label surfaces the era in the legend
 *   note  — optional caption under the ribbon
 */
import { CATEGORICAL } from '../../lib/palette'

export function WarmingStripes({
  from,
  to,
  eras,
  note,
}: {
  from: number
  to: number
  /** периоды-эпохи; heat 0..3: зима → нейтрально → тепло → жара */
  eras: Array<{ start: number; end: number; heat: 0 | 1 | 2 | 3; label?: string }>
  note?: string
}) {
  // neutral cold → neutral → warm → hot ramp, drawn from the palette
  const HEAT = [
    CATEGORICAL[0], // cold  (blue)
    'var(--vz-track,#F5F5F4)', // neutral
    CATEGORICAL[1], // warm  (orange)
    CATEGORICAL[5], // hot   (red)
  ]
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const heatFor = (year: number) => eras.find((e) => year >= e.start && year <= e.end)?.heat ?? 1
  return (
    <div className="vc-reveal max-w-[760px]">
      <div className="flex h-[72px] overflow-hidden rounded">
        {years.map((year) => (
          <div
            key={year}
            className="h-full flex-1"
            style={{ backgroundColor: HEAT[heatFor(year)] }}
          >
            <span className="sr-only">{year}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-1 h-[16px] text-[10.5px] text-[var(--vz-muted,#8A8A8A)]">
        {[from, 1970, 1990, 2012, to].map((year) => (
          <span
            key={year}
            className="absolute -translate-x-1/2"
            style={{ left: `${((year - from) / (to - from)) * 100}%` }}
          >
            {year}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[var(--vz-text3,#5C5C5C)]">
        {eras
          .filter((e) => e.label)
          .map((e) => (
            <span key={e.label} className="flex items-center gap-1.5">
              <span
                className="h-[9px] w-[9px] rounded-[2px]"
                style={{ backgroundColor: HEAT[e.heat] }}
              />
              {e.label}
            </span>
          ))}
      </div>
      {note ? (
        <p className="mt-2 text-[11px] leading-5 text-[var(--vz-muted,#8A8A8A)]">{note}</p>
      ) : null}
    </div>
  )
}
