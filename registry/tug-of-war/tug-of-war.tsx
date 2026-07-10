/**
 * TugOfWar — diverging duel bar, row by row.
 *
 * Answers: "in each head-to-head, which side pulls harder?" Every row is a
 * single rounded bar split at the midpoint — the left contender's share grows
 * the bar leftward, the right contender's share grows it rightward. The
 * winning side is rendered at full opacity; the loser is dimmed, so a scan
 * down the column reads as a series of verdicts.
 *
 * Pure props → markup (no hooks) — safe as a server component.
 *
 * Props:
 *  - left  { label, color }   the left contender (label + its bar color)
 *  - right { label, color }   the right contender (label + its bar color)
 *  - rows  Array<{ bench, leftValue, rightValue, date? }>
 *          one duel per row; values are shares (summed to compute the split),
 *          `bench` names the contest, optional `date` annotates it.
 */
export function TugOfWar({
  left,
  right,
  rows,
}: {
  left: { label: string; color: string }
  right: { label: string; color: string }
  rows: Array<{ bench: string; leftValue: number; rightValue: number; date?: string }>
}) {
  return (
    <div className="max-w-[720px]">
      <div className="mb-3 flex items-baseline justify-between text-[13px] font-bold">
        <span style={{ color: left.color }}>← {left.label}</span>
        <span style={{ color: right.color }}>{right.label} →</span>
      </div>
      {rows.map((row) => {
        const total = row.leftValue + row.rightValue
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
                  backgroundColor: left.color,
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
                  backgroundColor: right.color,
                  opacity: leftWins ? 0.45 : 1,
                }}
              >
                {row.rightValue}%
              </div>
              <span
                className="absolute top-0 h-full w-[2px] -translate-x-1/2 bg-white"
                style={{ left: `${leftPct}%` }}
              />
            </div>
          </div>
        )
      })}
      <p className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--vz-muted,#8A8A8A)]">
        bar skew = who pulls harder on this row; the bright side is the winner
      </p>
    </div>
  )
}
