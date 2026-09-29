'use client'

import { useEffect, useRef, useState } from 'react'
import { seriesColor } from '../../lib/palette'

/**
 * Free live series on building UI like this with AI agents (Oct 14, 21, 28): https://maven.com/p/dd061f/build-a-design-system-ai-agents-follow?utm_source=21st&utm_campaign=design-with-ai-agents&utm_medium=jsdoc
 *
 * BenchMatrix — the vendor-announcement benchmark board: rows are
 * benchmarks with a one-line note, grouped by domain (vertical label on
 * the left); columns are models with a vendor subline. The hero column is
 * tinted with its color and its values are painted in that color; the
 * best score of each row is bold on a plate. Answers "how do the models
 * compare across many benchmarks at once" — one picture instead of N
 * meters.
 *
 * Motion: rows cascade in on viewport entry; hovering a row focuses it
 * (others dim); hovering any cell highlights the whole column (compare a
 * model vertically). Everything is disabled under prefers-reduced-motion.
 *
 * Client component: serializable props only (numbers/strings/arrays).
 *
 * Props:
 * - models: BenchMatrixModel[] — column definitions (label, vendor?,
 *   color?, hero?). The hero's `color` MUST be a 6-digit hex — the column
 *   tint is built by hex+alpha concatenation (`${color}14`).
 * - groups: BenchMatrixGroup[] — domain groups of rows
 *   ({ bench, note?, values: (number|null)[], decimals? }).
 * - meta?: string — line above the matrix, right-aligned
 *   ('11 benches · snapshot Jul 9, 2026').
 * - footnote?: string — data provenance below the matrix.
 * - decimals?: number — decimal places for values (default 1; per-row
 *   override via row.decimals).
 * - benchColLabel?: string — header of the benchmark column
 *   (default 'benchmark').
 */

export type BenchMatrixModel = {
  id: string
  /** column label: 'Atlas 2 (max)' */
  label: string
  /** subline under the name: 'Meridian' */
  vendor?: string
  /** vendor color (6-digit hex); on the hero it paints values and the column tint */
  color?: string
  /** hero column: persistent tint + values in its color */
  hero?: boolean
}

export type BenchMatrixRow = {
  bench: string
  /** one-line note under the benchmark name */
  note?: string
  /** values per column in `models` order; null = dash */
  values: (number | null)[]
  /** decimal places for this row; defaults to the `decimals` prop */
  decimals?: number
}

export type BenchMatrixGroup = {
  /** vertical domain label: 'agentic' */
  label: string
  rows: BenchMatrixRow[]
}

const EASE = 'cubic-bezier(.2, .7, .3, 1)'
const MOTION_CSS = `
.vbm-row { transition: opacity .2s ease; }
.vbm-body:hover .vbm-row:not(:hover) { opacity: .45; }
.vbm-cell { transition: background-color .15s ease; }
.vbm-enter .vbm-row { animation: vbm-in .5s ${EASE} both; animation-delay: var(--vbm-d, 0ms); }
@keyframes vbm-in { from { opacity: 0; transform: translateY(6px); } }
@media (prefers-reduced-motion: reduce) {
  .vbm-row, .vbm-cell { transition: none !important; }
  .vbm-enter .vbm-row { animation: none !important; }
  .vbm-body:hover .vbm-row:not(:hover) { opacity: 1; }
}
`

/* hero column tint: the vendor color at low alpha — works in both themes.
   Requires a 6-digit hex (the alpha byte is appended to the string). */
const heroTint = (color: string) => `${color}14`

export function BenchMatrix({
  models,
  groups,
  meta,
  footnote,
  decimals = 1,
  benchColLabel = 'benchmark',
}: {
  models: BenchMatrixModel[]
  groups: BenchMatrixGroup[]
  /** line above the matrix, right-aligned: '11 benches · snapshot Jul 9, 2026' */
  meta?: string
  /** footnote below the matrix: data provenance */
  footnote?: string
  /** decimal places for values; default 1 */
  decimals?: number
  benchColLabel?: string
}) {
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setEntered(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const heroIndex = models.findIndex((m) => m.hero)
  const hero = heroIndex >= 0 ? models[heroIndex] : null
  const heroColor = hero?.color ?? seriesColor(0)

  const cellBg = (col: number, best: boolean) => {
    if (hoverCol === col) return 'var(--vz-hover, #F5F5F4)'
    if (col === heroIndex) return heroTint(heroColor)
    if (best) return 'var(--vz-track, #F5F5F4)'
    return undefined
  }

  /* running row index — the entry cascade runs across group boundaries */
  let rowIndex = 0

  return (
    <div ref={rootRef} className={entered ? 'vbm-enter' : ''}>
      <style>{MOTION_CSS}</style>
      {meta ? (
        <p className="mb-2.5 text-right text-[13px] text-[var(--vz-text3,#5C5C5C)]">{meta}</p>
      ) : null}
      <div className="relative rounded-[6px] border border-[var(--vz-frame,#E3E3E3)] bg-[var(--vz-surface,#fff)] text-[var(--vz-ink,#111)]">
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[640px] border-collapse [font-variant-numeric:tabular-nums]"
            onMouseLeave={() => setHoverCol(null)}
          >
            <thead>
              <tr className="border-b border-[var(--vz-frame,#E3E3E3)]">
                <th
                  colSpan={2}
                  className="px-4 py-3.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--vz-muted,#8A8A8A)]"
                >
                  {benchColLabel}
                </th>
                {models.map((m, col) => (
                  <th
                    key={m.id}
                    onMouseEnter={() => setHoverCol(col)}
                    className="vbm-cell px-3 py-3.5 text-center align-top"
                    style={{ background: cellBg(col, false) }}
                  >
                    <span
                      className="block text-[13px] font-semibold leading-tight"
                      style={col === heroIndex ? { color: heroColor } : undefined}
                    >
                      {m.label}
                    </span>
                    {m.vendor ? (
                      <span className="mt-0.5 block text-[11px] font-normal text-[var(--vz-muted,#8A8A8A)]">
                        {m.vendor}
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="vbm-body">
              {groups.map((group) =>
                group.rows.map((row, r) => {
                  const i = rowIndex++
                  const nums = row.values.filter((v): v is number => v !== null)
                  const best = nums.length > 1 ? Math.max(...nums) : null
                  const dec = row.decimals ?? decimals
                  return (
                    <tr
                      key={row.bench}
                      className={`vbm-row border-t ${
                        r === 0
                          ? 'border-[var(--vz-frame,#E3E3E3)]'
                          : 'border-[var(--vz-grid,#EDEDED)]'
                      }`}
                      style={{ ['--vbm-d' as string]: `${i * 45}ms` }}
                    >
                      {r === 0 ? (
                        <td
                          rowSpan={group.rows.length}
                          className="w-[44px] border-r border-[var(--vz-grid,#EDEDED)] px-2 text-center"
                        >
                          <span
                            className="inline-block rotate-180 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--vz-muted,#8A8A8A)]"
                            style={{ writingMode: 'vertical-rl' }}
                          >
                            {group.label}
                          </span>
                        </td>
                      ) : null}
                      <td className="min-w-[190px] px-4 py-3">
                        <span className="block text-[13.5px] font-semibold leading-tight">
                          {row.bench}
                        </span>
                        {row.note ? (
                          <span className="mt-0.5 block text-[11.5px] leading-snug text-[var(--vz-text3,#5C5C5C)]">
                            {row.note}
                          </span>
                        ) : null}
                      </td>
                      {models.map((m, col) => {
                        const v = row.values[col] ?? null
                        const isBest = v !== null && best !== null && v === best
                        return (
                          <td
                            key={m.id}
                            onMouseEnter={() => setHoverCol(col)}
                            className={`vbm-cell px-3 py-3 text-center text-[14px] ${
                              isBest ? 'font-bold' : ''
                            }`}
                            style={{
                              background: cellBg(col, isBest),
                              color:
                                col === heroIndex && v !== null
                                  ? heroColor
                                  : v === null
                                    ? 'var(--vz-muted, #8A8A8A)'
                                    : isBest
                                      ? 'var(--vz-ink, #111)'
                                      : 'var(--vz-text2, #3A3A3A)',
                            }}
                          >
                            {v === null ? '—' : v.toFixed(dec)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {footnote ? (
        <p className="mt-3 text-[13px] leading-6 text-[var(--vz-text3,#5C5C5C)]">{footnote}</p>
      ) : null}
    </div>
  )
}
