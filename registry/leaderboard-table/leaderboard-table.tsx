'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { seriesColor } from '../../lib/palette'

/**
 * LeaderboardBars — leaderboard-table genre (score bars + economy columns):
 * one row per model — badge + name [effort level], score as a horizontal
 * bar in the series color with +/-std whiskers, numeric economy columns
 * (cost / tokens / steps) on the right. Answers the 2-second question:
 * "who leads on score, and what does that score cost?"
 *
 * Toggles switch the dataset version and the mode ("Best" — one best run
 * per model / "All effort levels" — every run as its own row); a dropdown
 * filters models. Data rail is the same versions -> models -> runs shape
 * as FrontierBoard, so one dataset can feed both forms.
 *
 * Motion: toggling morphs the board (rows slide to their new rank via
 * translateY, bars re-stretch, whiskers follow); hovering a row focuses it
 * (others dim, the bar thickens); entering the viewport grows bars from
 * the left with a stagger. Everything is disabled under
 * prefers-reduced-motion.
 *
 * Wide-figure genre: the board keeps a min-width of ~700px and scrolls
 * horizontally inside its own container on narrow screens.
 *
 * Props:
 * - versions: >=1 dataset versions (toggle buttons hidden when only one)
 * - columns: numeric columns right of the score, keyed into run.x;
 *   formatting is declarative (prefix/suffix/decimals), not functions
 * - meta: string right of the toggles, e.g. '113 tasks · updated Jul 1'
 * - footnote: line under the board (what the runs were executed on)
 * - xMax: score-scale ceiling (default: nice step above max(score+std))
 * - scoreSuffix / scoreLabel / modelColLabel / bestLabel / allRunsLabel /
 *   modelsLabel / allLabel: UI strings
 *
 * Client component: serializable props only.
 */

const r2 = (v: number) => Math.round(v * 100) / 100

export type LeaderboardRun = {
  /** effort level / mode — rendered as [high]; may be omitted */
  variant?: string
  /** score 0-100, bar length */
  score: number
  /** +/- score spread (std) — drawn as whiskers over the bar */
  std?: number
  /** X value per column key: { cost: 13.4, tokens: 96, steps: 47 } */
  x: Record<string, number>
}

export type LeaderboardModel = {
  /** name as shown in the row: 'atlas-4' */
  id: string
  /** series color; defaults to seriesColor(index) from the palette */
  color?: string
  /** vendor badge letter ('A', 'M', 'V'); defaults to first letter of id */
  badge?: string
  /** entity logo URL — rendered instead of the badge letter */
  logoUrl?: string
  runs: LeaderboardRun[]
}

export type LeaderboardVersion = {
  key: string
  /** toggle button text: 'v1.1' */
  label: string
  models: LeaderboardModel[]
}

export type LeaderboardColumn = {
  /** value key in run.x: 'cost' */
  key: string
  /** column header: 'cost' (rendered uppercase) */
  label: string
  prefix?: string
  suffix?: string
  /** digits after the decimal point; default 0 */
  decimals?: number
}

/** clean tick step from {1, 2, 2.5, 5} x 10^k, at most maxTicks divisions */
function niceStep(max: number, maxTicks = 5): number {
  if (max <= 0) return 1
  const bases = [1, 2, 2.5, 5]
  for (let exp = -2; exp <= 12; exp++) {
    for (const b of bases) {
      const step = b * 10 ** exp
      if (max / step <= maxTicks) return step
    }
  }
  return max
}

const ROW_H = 48
const EASE = 'cubic-bezier(.22, 1, .36, 1)'
const MOTION_CSS = `
.vlb-rows { transition: height .55s ${EASE}; }
.vlb-row { transition: transform .55s ${EASE}, opacity .25s ease, background-color .15s ease; }
.vlb-rows:hover .vlb-row:not(:hover) { opacity: .38; }
.vlb-row:hover { background-color: var(--vz-hover,#FAFAF9); }
.vlb-bar { transition: width .55s ${EASE}; transform-origin: left center; }
.vlb-barbox { transition: height .18s ease; }
.vlb-row:hover .vlb-barbox { height: 19px; }
.vlb-dim { color: var(--vz-text2,#3A3A3A); transition: color .15s ease; }
.vlb-row:hover .vlb-dim { color: var(--vz-ink,#111); }
.vlb-wh { transition: left .55s ${EASE}, width .55s ${EASE}; }
.vlb-fadein { animation: vlb-fadein .35s ease both; }
@keyframes vlb-fadein { from { opacity: 0; } }
.vlb-enter .vlb-bar { animation: vlb-grow .8s ${EASE} both; animation-delay: var(--vlb-d, 0ms); }
@keyframes vlb-grow { from { transform: scaleX(0); } }
.vlb-enter .vlb-late { animation: vlb-fadein .45s ease both; animation-delay: calc(var(--vlb-d, 0ms) + 260ms); }
.vlb-pop { animation: vlb-pop .18s cubic-bezier(.34, 1.56, .64, 1) both; }
@keyframes vlb-pop { from { opacity: 0; transform: scale(.92) translateY(3px); } }
@media (prefers-reduced-motion: reduce) {
  .vlb-rows, .vlb-row, .vlb-bar, .vlb-barbox, .vlb-wh, .vlb-dim { transition: none !important; }
  .vlb-enter .vlb-bar, .vlb-enter .vlb-late, .vlb-fadein, .vlb-pop { animation: none !important; }
  .vlb-rows:hover .vlb-row:not(:hover) { opacity: 1; }
}
`

export function LeaderboardBars({
  versions,
  columns,
  meta,
  footnote,
  xMax: xMaxProp,
  scoreSuffix = '%',
  scoreLabel = 'pass@1',
  modelColLabel = 'model',
  bestLabel = 'Best',
  allRunsLabel = 'All effort levels',
  modelsLabel = 'Models',
  allLabel = 'all',
}: {
  /** same data rail as FrontierBoard; version buttons hidden when only one */
  versions: LeaderboardVersion[]
  /** numeric columns right of the score, keyed into run.x */
  columns: LeaderboardColumn[]
  /** string right of the toggles: '113 tasks · updated Jul 1, 2026' */
  meta?: string
  /** footnote under the board: what the runs were executed on */
  footnote?: string
  /** score-scale ceiling; default: nice step above max(score+std) */
  xMax?: number
  scoreSuffix?: string
  scoreLabel?: string
  modelColLabel?: string
  bestLabel?: string
  allRunsLabel?: string
  modelsLabel?: string
  allLabel?: string
}) {
  const [versionKey, setVersionKey] = useState(versions[0]?.key)
  const [mode, setMode] = useState<'best' | 'all'>('best')
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
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
      { threshold: 0.2 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const version = versions.find((v) => v.key === versionKey) ?? versions[0]
  const models = useMemo(() => version?.models ?? [], [version])
  const visible = models.filter((m) => !hiddenIds.includes(m.id))

  /* color follows the entity: explicit m.color or a stable palette index */
  const colorOf = useMemo(() => {
    const map = new Map<string, string>()
    models.forEach((m, i) => map.set(m.id, m.color ?? seriesColor(i)))
    return map
  }, [models])

  const rows = useMemo(() => {
    const out = visible.flatMap((m) => {
      const runs = mode === 'best' ? [m.runs.reduce((a, b) => (b.score > a.score ? b : a))] : m.runs
      return runs.map((run) => ({ model: m, run }))
    })
    out.sort((a, b) => b.run.score - a.run.score || a.model.id.localeCompare(b.model.id))
    return out
  }, [visible, mode])

  /* scale spans all models of the version (not the filter) so the axis stays put */
  const axisMax = useMemo(() => {
    if (xMaxProp) return xMaxProp
    const max = Math.max(1, ...models.flatMap((m) => m.runs.map((r) => r.score + (r.std ?? 0))))
    const step = niceStep(max * 1.02)
    return step * Math.ceil((max * 1.02) / step)
  }, [models, xMaxProp])
  const tickStep = niceStep(axisMax)
  const ticks: number[] = []
  for (let t = 0; t <= axisMax; t += tickStep) ticks.push(r2(t))

  const pct = (v: number) => `${r2((v / axisMax) * 100)}%`
  const fmtVal = (v: number, c: LeaderboardColumn) =>
    `${c.prefix ?? ''}${c.decimals != null ? v.toFixed(c.decimals) : Math.round(v)}${c.suffix ?? ''}`

  const toggleModel = (id: string) =>
    setHiddenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const seg =
    'border border-[var(--vz-frame,#E3E3E3)] px-3.5 py-1.5 text-[13.5px] font-medium leading-none transition-all duration-150 active:scale-[0.94]'
  const segActive =
    'bg-[var(--vz-chip,#111)] text-[var(--vz-chip-ink,#fff)] border-[var(--vz-chip,#111)]'
  const segIdle =
    'bg-[var(--vz-surface,#fff)] text-[var(--vz-ink,#111)] hover:bg-[var(--vz-track,#F5F5F4)]'

  return (
    <div
      ref={rootRef}
      className={`text-[var(--vz-ink,#111)] [font-variant-numeric:tabular-nums] ${entered ? 'vlb-enter' : ''}`}
    >
      <style>{MOTION_CSS}</style>
      {/* control panel */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {versions.length > 1 ? (
          <div className="flex -space-x-px">
            {versions.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setVersionKey(v.key)}
                className={`${seg} first:rounded-l-[5px] last:rounded-r-[5px] ${v.key === version.key ? segActive : segIdle}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex -space-x-px">
          {(
            [
              ['best', bestLabel],
              ['all', allRunsLabel],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`${seg} first:rounded-l-[5px] last:rounded-r-[5px] ${mode === key ? segActive : segIdle}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          {meta ? <p className="text-[13.5px] text-[var(--vz-text3,#5C5C5C)]">{meta}</p> : null}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              className={`${seg} rounded-[5px] ${segIdle}`}
            >
              {modelsLabel} ({visible.length}/{models.length}) <span aria-hidden>⌄</span>
            </button>
            {menuOpen ? (
              <div className="vlb-pop absolute right-0 z-10 mt-1 max-h-72 w-60 origin-top-right overflow-auto rounded-[5px] border border-[var(--vz-frame,#E3E3E3)] bg-[var(--vz-surface,#fff)] py-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setHiddenIds([])}
                  className="block w-full px-3 py-1.5 text-left text-[12px] uppercase tracking-[0.08em] text-[var(--vz-muted,#8A8A8A)] hover:bg-[var(--vz-track,#F5F5F4)]"
                >
                  {allLabel}
                </button>
                {models.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13.5px] hover:bg-[var(--vz-track,#F5F5F4)]"
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenIds.includes(m.id)}
                      onChange={() => toggleModel(m.id)}
                      className="accent-[var(--vz-ink,#111)]"
                    />
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colorOf.get(m.id) }}
                    />
                    {m.id}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* the board */}
      <div className="relative mt-4 rounded-[6px] border border-[var(--vz-frame,#E3E3E3)] bg-[var(--vz-surface,#fff)]">
        <div className="overflow-x-auto px-4 pt-3 md:px-5">
          <div className="min-w-[700px] pb-6">
            {/* column header */}
            <div className="flex items-center gap-3 border-b border-[var(--vz-frame,#E3E3E3)] px-1 pb-2.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--vz-muted,#8A8A8A)]">
              <div className="w-[215px] shrink-0">{modelColLabel}</div>
              <div className="min-w-[100px] flex-1" />
              <div className="w-[84px] shrink-0 text-right">{scoreLabel}</div>
              {columns.map((c) => (
                <div key={c.key} className="w-[68px] shrink-0 text-right">
                  {c.label}
                </div>
              ))}
            </div>

            {/* rows: absolute + translateY by rank — morphs on toggle */}
            <div className="vlb-rows relative" style={{ height: rows.length * ROW_H }}>
              {rows.map(({ model: m, run }, i) => (
                <div
                  key={`${m.id}::${run.variant ?? 'solo'}`}
                  className="vlb-row vlb-fadein absolute left-0 right-0 flex items-center gap-3 border-b border-[var(--vz-grid,#EDEDED)] px-1"
                  style={{
                    transform: `translateY(${i * ROW_H}px)`,
                    height: ROW_H,
                    ['--vlb-d' as string]: `${i * 55}ms`,
                  }}
                >
                  <div className="flex w-[215px] shrink-0 items-center gap-2.5">
                    {m.logoUrl ? (
                      <img
                        src={m.logoUrl}
                        alt=""
                        aria-hidden
                        className="h-[22px] w-[22px] shrink-0 rounded-[5px] bg-[var(--vz-surface,#fff)] object-contain p-[2px]"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--vz-chip,#141414)] text-[11px] font-bold text-[var(--vz-chip-ink,#fff)]"
                      >
                        {m.badge ?? m.id[0]?.toUpperCase()}
                      </span>
                    )}
                    <span className="truncate text-[13px] font-semibold">
                      {m.id}
                      {run.variant ? (
                        <span className="font-normal text-[var(--vz-muted,#8A8A8A)]">
                          {' '}
                          [{run.variant}]
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="vlb-barbox relative h-[14px] min-w-[100px] flex-1">
                    <div className="absolute inset-0 rounded-r-[4px] bg-[var(--vz-track,#F5F5F4)]" />
                    <div
                      className="vlb-bar absolute inset-y-0 left-0 rounded-r-[4px]"
                      style={{
                        width: pct(run.score),
                        backgroundColor: colorOf.get(m.id),
                        color: colorOf.get(m.id),
                      }}
                    />
                    {run.std ? (
                      <div
                        className="vlb-wh vlb-late absolute top-1/2 flex -translate-y-1/2 items-center"
                        style={{
                          left: pct(Math.max(0, run.score - run.std)),
                          width: pct(run.std * 2),
                        }}
                      >
                        <span className="h-[11px] w-[1.5px] shrink-0 bg-[var(--vz-text2,#3A3A3A)]" />
                        <span className="h-[1.5px] min-w-0 flex-1 bg-[var(--vz-text2,#3A3A3A)]" />
                        <span className="h-[11px] w-[1.5px] shrink-0 bg-[var(--vz-text2,#3A3A3A)]" />
                      </div>
                    ) : null}
                  </div>
                  <div className="vlb-late w-[84px] shrink-0 whitespace-nowrap text-right">
                    <span className="text-[15px] font-semibold">
                      {Math.round(run.score)}
                      {scoreSuffix}
                    </span>
                    {run.std ? (
                      <span className="ml-1 text-[11.5px] text-[var(--vz-muted,#8A8A8A)]">
                        ±{run.std}
                        {scoreSuffix}
                      </span>
                    ) : null}
                  </div>
                  {columns.map((c) => (
                    <div
                      key={c.key}
                      className="vlb-dim vlb-late w-[68px] shrink-0 whitespace-nowrap text-right text-[13.5px]"
                    >
                      {fmtVal(run.x[c.key] ?? 0, c)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* score axis under the bars */}
            <div className="flex items-center gap-3 px-1 pt-2">
              <div className="w-[215px] shrink-0" />
              <div className="relative h-[16px] min-w-[100px] flex-1">
                {ticks.map((t) => (
                  <span
                    key={t}
                    className="absolute top-0 -translate-x-1/2 text-[11.5px] text-[var(--vz-muted2,#767676)]"
                    style={{ left: pct(t) }}
                  >
                    {t}
                    {scoreSuffix}
                  </span>
                ))}
              </div>
              <div className="w-[84px] shrink-0" />
              {columns.map((c) => (
                <div key={c.key} className="w-[68px] shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {footnote ? (
        <p className="mt-3 text-[13px] leading-6 text-[var(--vz-text3,#5C5C5C)]">{footnote}</p>
      ) : null}
    </div>
  )
}
