/**
 * RankBarChart — horizontal ranked bars (label · bar · value).
 *
 * Answers: "how do these items rank against each other on one metric?"
 * Bars scale from zero to the list max (or an explicit `maxValue`). Each row
 * is label (+ optional sub) · track-backed bar · right-aligned value. Pure
 * RSC: div/SVG only, no client JS, no hooks.
 *
 * Props:
 *   items: RankBarItem[]   — rows, in the order you want them ranked
 *   maxValue?: number      — fix the scale max (else = max item value)
 *   unit?: string          — appended to the numeric value label (e.g. "%")
 *
 * RankBarItem:
 *   label       — row title
 *   value       — numeric magnitude driving bar width
 *   valueLabel? — override the printed value (default: `${value}${unit}`)
 *   sub?        — muted second line under the label
 *   highlight?  — hero row: accent bar + bold label
 *   color?      — explicit series color; `highlight` wins over it
 *
 * Colors: structural tokens read from theme.css var(--vz-*); the highlight
 * accent uses the first categorical hue from ./palette.
 */

import { seriesColor } from "../../lib/palette"

const HIGHLIGHT = seriesColor(0)
const BAR_DEFAULT = "var(--vz-axis,#D9D9D9)"

export type RankBarItem = {
  label: string
  value: number
  /** printed value label (default — the number itself) */
  valueLabel?: string
  /** muted line under the label: pairing, date, note */
  sub?: string
  /** hero row — accent bar + bold label */
  highlight?: boolean
  /** own series color; highlight wins over it */
  color?: string
}

export function RankBarChart({
  items,
  maxValue,
  unit = "",
}: {
  items: RankBarItem[]
  maxValue?: number
  unit?: string
}) {
  const max = maxValue ?? Math.max(...items.map((item) => item.value), 1)
  return (
    <div className="vc-focus space-y-3">
      {items.map((item) => {
        const width = Math.max(2, Math.round((item.value / max) * 100))
        const color = item.highlight ? HIGHLIGHT : (item.color ?? BAR_DEFAULT)
        return (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(0,200px)_minmax(0,1fr)_72px] items-center gap-4"
          >
            <div className="min-w-0">
              <p
                className={`truncate text-[13px] leading-5 ${item.highlight ? "font-bold" : "font-medium text-[var(--vz-text3,#5C5C5C)]"}`}
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
                  borderRadius: "0 4px 4px 0",
                }}
              />
            </div>
            <p
              className={`text-right text-[13px] tabular-nums ${item.highlight ? "font-bold" : "font-medium text-[var(--vz-text3,#5C5C5C)]"}`}
            >
              {item.valueLabel ?? `${item.value}${unit}`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
