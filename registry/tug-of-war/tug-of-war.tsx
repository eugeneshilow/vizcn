/**
 * TugOfWar — diverging duel bars: two contenders pull a 100% rope per row.
 *
 * Answers "who wins where, head to head?" in 2 seconds: each row is one
 * arena (benchmark, market, category) rendered as a single full-width bar
 * split at the left/right score ratio. The winning side keeps full opacity,
 * the losing side fades — the skew of the rope IS the verdict. Pure server
 * component — div-based, zero client JS.
 *
 * Props:
 * - left / right: { label, color? } — the two contenders; colors default to
 *   seriesColor(0) / seriesColor(1).
 * - rows: { bench, leftValue, rightValue, date? }[] — one duel per row;
 *   values in the same unit (rendered with a "%" suffix), date is an
 *   optional muted caption next to the row title.
 * - footnote?: string — reading-key line under the chart (pass "" to hide).
 */
import { seriesColor } from '../../lib/palette'

export type TugOfWarRow = {
  bench: string
  leftValue: number
  rightValue: number
  date?: string
}

/**
 * Diverging duel bars: each row is a 100% rope split between two sides;
 * the brighter side is the winner.
 */
export function TugOfWar({
  left,
  right,
  rows,
  footnote = 'rope skew = who is stronger in this arena; the bright side wins',
}: {
  left: { label: string; color?: string }
  right: { label: string; color?: string }
  rows: TugOfWarRow[]
  footnote?: string
}) {
  const leftColor = left.color ?? seriesColor(0)
  const rightColor = right.color ?? seriesColor(1)
  return (
    <div className="max-w-[720px]">
      <div className="mb-3 flex items-baseline justify-between text-[13px] font-bold">
        <span style={{ color: leftColor }}>← {left.label}</span>
        <span style={{ color: rightColor }}>{right.label} →</span>
      </div>
      {rows.map((row) => {
        const total = row.leftValue + row.rightValue || 1
        const leftPct = (row.leftValue / total) * 100
        const leftWins = row.leftValue > row.rightValue
        return (
          <div key={row.bench} className="border-b border-[var(--vz-grid,#EDEDED)] py-3">
            <p className="mb-1.5 text-center text-[11.5px] font-semibold">
              {row.bench}
              {row.date ? (
                <span className="ml-2 font-normal text-[var(--vz-muted,#8A8A8A)]">{row.date}</span>
              ) : null}
            </p>
            <div className="vc-grow-x relative flex h-[22px] overflow-hidden rounded-full">
              <div
                className="flex items-center pl-3 text-[11px] font-bold text-white"
                title={`${left.label}: ${row.leftValue}% - ${row.bench}`}
                style={{
                  width: `${leftPct}%`,
                  backgroundColor: leftColor,
                  opacity: leftWins ? 1 : 0.45,
                }}
              >
                {row.leftValue}%
              </div>
              <div
                className="flex items-center justify-end pr-3 text-[11px] font-bold text-white"
                title={`${right.label}: ${row.rightValue}% - ${row.bench}`}
                style={{
                  width: `${100 - leftPct}%`,
                  backgroundColor: rightColor,
                  opacity: leftWins ? 0.45 : 1,
                }}
              >
                {row.rightValue}%
              </div>
              <span
                className="absolute top-0 h-full w-[2px] -translate-x-1/2 bg-[var(--vz-ring,#fff)]"
                style={{ left: `${leftPct}%` }}
              />
            </div>
          </div>
        )
      })}
      {footnote ? (
        <p className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--vz-muted,#8A8A8A)]">
          {footnote}
        </p>
      ) : null}
    </div>
  )
}
