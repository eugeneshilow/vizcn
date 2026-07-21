import { seriesColor } from '../../lib/palette'

/**
 * PairedBars — grouped horizontal bars for two measurements per subject.
 *
 * Answers "how do two measurements of the same subjects compare?" in 2
 * seconds: each subject owns exactly two thin bars on one shared 0..max axis.
 * The primary measure is fully saturated; the secondary uses the same entity
 * hue at 55% opacity. Gridlines and a tick rail keep deltas readable across
 * groups. Plain div rendering with serializable props; no client runtime.
 *
 * Props:
 * - groups: {label, color?, a: {label,value,valueLabel?}, b: {...}}[].
 * - max?: shared axis ceiling; defaults to the largest value.
 * - unit?: suffix appended to raw values.
 * - ticks?: axis/grid values; defaults to four equal intervals.
 * - barLabel?: uppercase header over the bar zone.
 */

const MONO = 'ui-monospace, SFMono-Regular, monospace'

export type PairedBarMeasure = {
  label: string
  value: number
  valueLabel?: string
}

export type PairedBarGroup = {
  label: string
  color?: string
  a: PairedBarMeasure
  b: PairedBarMeasure
}

function GridLines({ ticks, max }: { ticks: number[]; max: number }) {
  return (
    <div aria-hidden className="absolute inset-0">
      {ticks
        .filter((tick) => tick > 0 && tick < max)
        .map((tick) => (
          <span
            key={tick}
            className="absolute inset-y-0 border-l border-[var(--vz-grid,#e3e3e3)]"
            style={{ left: `${(tick / max) * 100}%` }}
          />
        ))}
    </div>
  )
}

export function PairedBars({
  groups,
  max,
  unit = '',
  ticks,
  barLabel,
}: {
  groups: PairedBarGroup[]
  max?: number
  unit?: string
  ticks?: number[]
  barLabel?: string
}) {
  const dataMax = Math.max(...groups.flatMap((group) => [group.a.value, group.b.value]), 1)
  const axisMax = max && max > 0 ? max : dataMax
  const axisTicks = ticks ?? [0, axisMax / 3, (axisMax * 2) / 3, axisMax]
  const pct = (value: number) => Math.max(0, Math.min(100, (value / axisMax) * 100))
  const formatTick = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1))

  return (
    <div className="overflow-x-auto border-y border-[var(--vz-ink,#111111)] py-5 text-[var(--vz-ink,#111111)] [font-variant-numeric:tabular-nums]">
      <div className="min-w-[620px]">
        <div
          className="grid grid-cols-[126px_minmax(260px,1fr)_66px] gap-x-3 border-b border-[var(--vz-grid,#e3e3e3)] pb-2 text-[9px] uppercase tracking-[0.1em] text-[var(--vz-muted,#8a8a8a)]"
          style={{ fontFamily: MONO }}
        >
          <span>measurement</span>
          <span>{barLabel}</span>
          <span className="text-right">value</span>
        </div>

        <div className="divide-y divide-[var(--vz-grid,#e3e3e3)]">
          {groups.map((group, groupIndex) => {
            const color = group.color ?? seriesColor(groupIndex)
            return (
              <section key={`${group.label}-${groupIndex}`} className="py-4 first:pt-4 last:pb-2">
                <h3 className="mb-2 flex items-center gap-2 text-[12px] font-semibold">
                  <span aria-hidden className="h-2 w-2" style={{ backgroundColor: color }} />
                  {group.label}
                </h3>
                <div className="space-y-1.5">
                  {[group.a, group.b].map((measure, measureIndex) => {
                    const valueLabel = measure.valueLabel ?? `${measure.value}${unit}`
                    return (
                      <div
                        key={`${measure.label}-${measureIndex}`}
                        className="grid grid-cols-[126px_minmax(260px,1fr)_66px] items-center gap-x-3"
                      >
                        <p
                          className="truncate text-[9.5px] text-[var(--vz-muted,#8a8a8a)]"
                          style={{ fontFamily: MONO }}
                        >
                          {measure.label}
                        </p>
                        <div
                          className="relative h-[12px] border-y border-[var(--vz-track,#f0f0f0)]"
                          title={`${group.label} · ${measure.label} · ${valueLabel}`}
                        >
                          <GridLines ticks={axisTicks} max={axisMax} />
                          <div
                            className="absolute inset-y-[2px] left-0"
                            style={{
                              width: `${pct(measure.value)}%`,
                              backgroundColor: color,
                              opacity: measureIndex === 0 ? 1 : 0.55,
                            }}
                          />
                        </div>
                        <p className="text-right text-[10.5px] font-semibold" style={{ fontFamily: MONO }}>
                          {valueLabel}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <div
          className="mt-3 grid grid-cols-[126px_minmax(260px,1fr)_66px] gap-x-3 text-[9px] text-[var(--vz-muted,#8a8a8a)]"
          style={{ fontFamily: MONO }}
        >
          <span />
          <div className="flex justify-between">
            {axisTicks.map((tick, index) => (
              <span key={`${tick}-${index}`}>
                {formatTick(tick)}
                {index === axisTicks.length - 1 ? unit : ''}
              </span>
            ))}
          </div>
          <span />
        </div>
      </div>
    </div>
  )
}
