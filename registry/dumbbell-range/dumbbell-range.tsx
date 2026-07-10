/**
 * DumbbellRange — two endpoints per row on a shared zero-based scale,
 * joined by a connector bar (dumbbell genre).
 *
 * Answers "how far apart are the two values per row, and who sits where?"
 * — e.g. min/max price, input/output cost, before/after score. Each row:
 * label · track with lo-mark, hi-mark and connector · numeric pair. The
 * hero row gets an accent connector and an accent hi-mark; all rows share
 * one scale from zero to a nice ceiling above the largest hi value (or an
 * explicit maxValue). Pure server component — div-based, zero client JS.
 *
 * Props:
 * - rows: DumbbellRow[] — label, lo, hi, optional highlight.
 * - maxValue?: number — scale ceiling (default: nice ceiling over max hi).
 * - unit?: string — prefix for numeric values (default "$").
 * - formatValue?: (v: number) => string — overrides unit formatting.
 * - loLabel? / hiLabel? — legend names for the two endpoints
 *   (default "lo" / "hi").
 * - caption?: string — extra legend text after the endpoint names.
 * - loColor? — lo mark color (default seriesColor(0)).
 * - hiColor? — hi mark color on highlighted rows (default seriesColor(5)).
 * - highlightColor? — connector color on highlighted rows
 *   (default seriesColor(1)).
 */
import { seriesColor } from '../../lib/palette'

export type DumbbellRow = {
  label: string
  /** first endpoint (lower bound, "from", input…) */
  lo: number
  /** second endpoint (upper bound, "to", output…) */
  hi: number
  /** hero row — accent connector + hi mark, bold label */
  highlight?: boolean
}

/** Round a raw maximum up to a "nice" axis ceiling. */
function niceMax(raw: number): number {
  const mag = 10 ** Math.floor(Math.log10(raw / 4))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((m) => m * 5 >= raw) ?? raw / 4
  return step * Math.ceil(raw / step)
}

/**
 * Dumbbell range rows: two marks per row joined by a connector, one shared
 * zero-based scale. Ranking/comparison genre for paired values.
 */
export function DumbbellRange({
  rows,
  maxValue,
  unit = '$',
  formatValue,
  loLabel = 'lo',
  hiLabel = 'hi',
  caption,
  loColor = seriesColor(0),
  hiColor = seriesColor(5),
  highlightColor = seriesColor(1),
}: {
  rows: DumbbellRow[]
  maxValue?: number
  unit?: string
  formatValue?: (v: number) => string
  loLabel?: string
  hiLabel?: string
  caption?: string
  loColor?: string
  hiColor?: string
  highlightColor?: string
}) {
  const max = maxValue ?? niceMax(Math.max(...rows.map((r) => Math.max(r.lo, r.hi)), 1))
  const fmt = formatValue ?? ((v: number) => `${unit}${v}`)
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const x1 = (Math.min(r.lo, r.hi) / max) * 100
        const x2 = (Math.max(r.lo, r.hi) / max) * 100
        return (
          <div
            key={r.label}
            className="grid grid-cols-[150px_minmax(0,1fr)_120px] items-center gap-4"
          >
            <p
              className={`truncate text-[13px] ${r.highlight ? 'font-bold text-[var(--vz-ink,#111)]' : 'font-medium text-[var(--vz-text3,#5C5C5C)]'}`}
            >
              {r.label}
            </p>
            <div className="relative h-[22px]">
              <div className="absolute inset-y-[9px] left-0 right-0 rounded bg-[var(--vz-track,#F5F5F4)]" />
              <div
                className="vc-grow-x absolute inset-y-[9px] rounded"
                style={{
                  left: `${x1}%`,
                  width: `${Math.max(x2 - x1, 0.5)}%`,
                  backgroundColor: r.highlight ? highlightColor : 'var(--vz-axis,#C9C5BE)',
                }}
              />
              <span
                className="vc-mark absolute top-0 h-[22px] w-[3px] rounded"
                style={{ left: `${(r.lo / max) * 100}%`, backgroundColor: loColor }}
              />
              <span
                className="vc-mark absolute top-0 h-[22px] w-[3px] rounded"
                style={{
                  left: `${(r.hi / max) * 100}%`,
                  backgroundColor: r.highlight ? hiColor : 'var(--vz-muted,#8A8A8A)',
                }}
              />
            </div>
            <p className="text-right text-[12.5px] tabular-nums text-[var(--vz-text3,#5C5C5C)]">
              {fmt(r.lo)} <span className="text-[var(--vz-axis,#C9C9C9)]">/</span>{' '}
              <b className="text-[var(--vz-ink,#111)]">{fmt(r.hi)}</b>
            </p>
          </div>
        )
      })}
      <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--vz-muted,#8A8A8A)]">
        <span style={{ color: loColor }}>▎</span>
        {loLabel} · <span style={{ color: hiColor }}>▎</span>
        {hiLabel}
        {caption ? ` — ${caption}` : null}
      </p>
    </div>
  )
}
