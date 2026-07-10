/**
 * RankBarChart — horizontal ranking bars: label · bar · value.
 *
 * Answers "who leads, by how much?" in 2 seconds: rows sorted by the caller,
 * bars scaled from zero to the max value of the list (or an explicit
 * maxValue), the hero row highlighted in an accent color with bold text.
 * Leaderboard genre: clean data rows, no chart chrome. Pure server
 * component — div-based, zero client JS.
 *
 * Props:
 * - items: RankBarItem[] — label, value, optional valueLabel / sub /
 *   highlight / per-row color.
 * - maxValue?: number — scale ceiling (default: max item value).
 * - unit?: string — suffix appended to plain numeric values (e.g. "%").
 * - highlightColor?: string — bar color for highlighted rows
 *   (default: seriesColor(0)).
 */
import { seriesColor } from '../../lib/palette'

const BAR_DEFAULT = 'var(--vz-axis,#D9D9D9)'

export type RankBarItem = {
  label: string
  value: number
  /** value caption (default: the number itself) */
  valueLabel?: string
  /** muted line under the label: vendor, date, note */
  sub?: string
  /** hero row — accent bar + bold label */
  highlight?: boolean
  /** custom series color (per-vendor); highlight wins */
  color?: string
}

/**
 * Horizontal ranking bars (leaderboard-table genre): label · bar · value.
 * Scale runs from zero to the max value of the list (or maxValue).
 */
export function RankBarChart({
  items,
  maxValue,
  unit = '',
  highlightColor = seriesColor(0),
}: {
  items: RankBarItem[]
  maxValue?: number
  unit?: string
  highlightColor?: string
}) {
  const max = maxValue ?? Math.max(...items.map((item) => item.value), 1)
  return (
    <div className="vc-focus space-y-3">
      {items.map((item) => {
        const width = Math.max(2, Math.round((item.value / max) * 100))
        const color = item.highlight ? highlightColor : (item.color ?? BAR_DEFAULT)
        return (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(0,200px)_minmax(0,1fr)_72px] items-center gap-4"
          >
            <div className="min-w-0">
              <p
                className={`truncate text-[13px] leading-5 ${item.highlight ? 'font-bold' : 'font-medium text-[var(--vz-text3,#5C5C5C)]'}`}
              >
                {item.label}
              </p>
              {item.sub ? (
                <p className="truncate text-[10.5px] leading-4 text-[var(--vz-muted,#8A8A8A)]">
                  {item.sub}
                </p>
              ) : null}
            </div>
            <div
              className="h-[16px] bg-[var(--vz-track,#F5F5F4)]"
              title={`${item.label} · ${item.valueLabel ?? item.value}`}
            >
              <div
                className="vc-grow-x h-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: color,
                  borderRadius: '0 4px 4px 0',
                }}
              />
            </div>
            <p
              className={`text-right text-[13px] tabular-nums ${item.highlight ? 'font-bold' : 'font-medium text-[var(--vz-text3,#5C5C5C)]'}`}
            >
              {item.valueLabel ?? `${item.value}${unit}`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
