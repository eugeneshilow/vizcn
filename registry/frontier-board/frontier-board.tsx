'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { seriesColor } from '../../lib/palette'

/**
 * FrontierBoard — interactive efficiency-frontier leaderboard: a scatter of
 * score x cost where each model's runs (effort levels) are connected into a
 * frontier line. Answers the 2-second question: "which model gives the most
 * score per dollar/token, and at what effort level?"
 *
 * The X axis is INVERTED (cheaper is to the right), so up-and-right is
 * strictly better. Series labels are colored like their line; toggles switch
 * the X metric and the dataset version; a dropdown filters models; hovering
 * a point or line focuses that series and shows a tooltip.
 *
 * Motion: switching metric/version morphs points (transform) and lines
 * (CSS transition of the `d` property; browsers without support just jump
 * to the new shape); hovering a series dims the others; entering the
 * viewport draws lines in and springs points. Everything is disabled under
 * prefers-reduced-motion.
 *
 * Props:
 * - title: heading inside the plot area, e.g. 'SWE-bench score'
 * - versions: >=1 dataset versions (toggle buttons hidden when only one)
 * - metrics: >=1 X-axis metrics (toggle buttons hidden when only one)
 * - yMax / yTickSuffix: Y-axis ceiling and tick suffix (default '%')
 * - subjectId: id of the page's subject series — drawn bolder while
 *   nothing is hovered
 * - meta / efficientNote / modelsLabel / allLabel / defaultNote: UI strings
 *
 * Data is serializable props only (client component): numbers and strings.
 * Axis formatting comes from tickPrefix/tickSuffix, not functions. All
 * coordinates are rounded via r2() to avoid hydration mismatches.
 */

const r2 = (v: number) => Math.round(v * 100) / 100

export type FrontierRun = {
  /** effort level / mode — rendered as [high]; may be omitted */
  variant?: string
  /** score 0-100, Y axis */
  score: number
  /** +/- score spread (std); the frontier does not draw it */
  std?: number
  /** X value per metric key: { cost: 13.4, tokens: 96, steps: 47 } */
  x: Record<string, number>
  /** footnote under the label (usually the default configuration) */
  isDefault?: boolean
  /** draw the model's text label at this point */
  labeled?: boolean
  /** manual label offset in SVG px; a far offset draws a leader line */
  labelDx?: number
  labelDy?: number
}

export type FrontierModel = {
  /** name as shown in the label: 'atlas-4' */
  id: string
  /** series color; defaults to seriesColor(index) from the palette */
  color?: string
  /** vendor badge letter ('A', 'M', 'V'); defaults to first letter of id */
  badge?: string
  /** entity logo URL — scoreboard views may render it instead of a letter */
  logoUrl?: string
  runs: FrontierRun[]
}

export type FrontierMetric = {
  key: string
  /** toggle button text: 'Price' */
  label: string
  /** X-axis caption: 'Avg cost per task' */
  axisLabel: string
  tickPrefix?: string
  tickSuffix?: string
}

export type FrontierVersion = {
  key: string
  /** toggle button text: 'v1.1' */
  label: string
  models: FrontierModel[]
}

/** clean tick step from {1, 2, 2.5, 5} x 10^k, at most maxTicks divisions */
function niceStep(max: number, maxTicks = 6): number {
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

const W = 1040
const H = 680
const PAD = { top: 64, right: 28, bottom: 64, left: 64 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

const EASE = 'cubic-bezier(.22, 1, .36, 1)'
const MOTION_CSS = `
.vfb-move { transition: transform .55s ${EASE}, opacity .25s ease; }
.vfb-line { transition: d .55s ${EASE}, opacity .25s ease, stroke-opacity .25s ease, stroke-width .25s ease; }
.vfb-grp { transition: opacity .25s ease; }
.vfb-dot { transform-box: fill-box; transform-origin: center; transition: transform .18s ease; }
.vfb-pt { cursor: pointer; }
.vfb-pt:hover .vfb-dot { transform: scale(1.5); }
.vfb-enter .vfb-dot { animation: vfb-in .5s cubic-bezier(.34, 1.56, .64, 1) both; animation-delay: var(--vfb-d, 0ms); }
@keyframes vfb-in { from { transform: scale(0); } }
.vfb-enter .vfb-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: vfb-dash 1s ease-out both; animation-delay: var(--vfb-d, 0ms); }
@keyframes vfb-dash { to { stroke-dashoffset: 0; } }
.vfb-pop { animation: vfb-pop .18s cubic-bezier(.34, 1.56, .64, 1) both; }
@keyframes vfb-pop { from { opacity: 0; transform: scale(.92) translateY(3px); } }
.vfb-fadein { animation: vfb-fadein .35s ease both; }
@keyframes vfb-fadein { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .vfb-move, .vfb-line, .vfb-dot { transition: none !important; }
  .vfb-enter .vfb-dot, .vfb-enter .vfb-draw, .vfb-pop, .vfb-fadein { animation: none !important; }
  .vfb-enter .vfb-draw { stroke-dasharray: none; stroke-dashoffset: 0; }
}
`

export function FrontierBoard({
  title,
  meta,
  versions,
  metrics,
  yMax: yMaxProp,
  yTickSuffix = '%',
  efficientNote = 'more efficient ↗',
  modelsLabel = 'Models',
  allLabel = 'all',
  defaultNote = 'default',
  subjectId,
}: {
  /** heading inside the plot area: 'SWE-bench score' */
  title: string
  /** line to the right of the toggles: '113 tasks - updated Jul 1, 2026' */
  meta?: string
  /** >=1 dataset versions; version buttons hidden when only one */
  versions: FrontierVersion[]
  /** >=1 X-axis metrics; buttons hidden when only one */
  metrics: FrontierMetric[]
  /** Y-axis ceiling; defaults to a clean step above the data maximum */
  yMax?: number
  yTickSuffix?: string
  /** italic note in the top-right corner of the plot */
  efficientNote?: string
  modelsLabel?: string
  allLabel?: string
  /** footnote text at isDefault points */
  defaultNote?: string
  /** id of the page's subject series: drawn bolder/brighter while nothing
   * is hovered, so "where is our model" reads at a glance */
  subjectId?: string
}) {
  const [versionKey, setVersionKey] = useState(versions[0]?.key)
  const [metricKey, setMetricKey] = useState(metrics[0]?.key)
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{
    cx: number
    cy: number
    text: string
    sub: string
  } | null>(null)

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
  const metric = metrics.find((m) => m.key === metricKey) ?? metrics[0]
  const models = useMemo(
    () => (version?.models ?? []).map((m, i) => ({ ...m, color: m.color ?? seriesColor(i) })),
    [version]
  )
  const visible = models.filter((m) => !hiddenIds.includes(m.id))

  const geometry = useMemo(() => {
    const xs = visible.flatMap((m) => m.runs.map((run) => run.x[metric.key] ?? 0))
    const ys = visible.flatMap((m) => m.runs.map((run) => run.score))
    const xMaxData = Math.max(1, ...xs)
    const xEnd = xMaxData * 1.07
    const xStep = niceStep(xEnd)
    const yRaw = Math.max(1, ...ys) * 1.1
    const yStep = niceStep(yMaxProp ?? yRaw, 8)
    const yTop = yMaxProp ?? yStep * Math.ceil(yRaw / yStep)
    return { xEnd, xStep, yTop, yStep }
  }, [visible, metric.key, yMaxProp])

  const sx = (x: number) => r2(PAD.left + (1 - x / geometry.xEnd) * PLOT_W)
  const sy = (y: number) => r2(PAD.top + (1 - y / geometry.yTop) * PLOT_H)
  const fmt = (v: number) =>
    `${metric.tickPrefix ?? ''}${Number.isInteger(v) ? v : r2(v)}${metric.tickSuffix ?? ''}`

  const xTicks: number[] = []
  for (let t = 0; t <= geometry.xEnd; t += geometry.xStep) xTicks.push(r2(t))
  const yTicks: number[] = []
  for (let t = 0; t <= geometry.yTop; t += geometry.yStep) yTicks.push(r2(t))

  const toggleModel = (id: string) =>
    setHiddenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  // hover focus wins; at rest the page subject dims the others so
  // "where is our model" reads at first glance
  const dimmed = (id: string) => {
    if (focusId !== null) return focusId !== id ? 0.14 : 1
    if (subjectId && subjectId !== id) return 0.45
    return 1
  }

  const seg =
    'border border-[var(--vz-frame,#E3E3E3)] px-3.5 py-1.5 text-[13.5px] font-medium leading-none transition-all duration-150 active:scale-[0.94]'
  const segActive =
    'bg-[var(--vz-chip,#111)] text-[var(--vz-chip-ink,#fff)] border-[var(--vz-chip,#111)]'
  const segIdle =
    'bg-[var(--vz-surface,#fff)] text-[var(--vz-ink,#111)] hover:bg-[var(--vz-track,#F5F5F4)]'

  return (
    <div
      ref={rootRef}
      className={`text-[var(--vz-ink,#111)] [font-variant-numeric:tabular-nums] ${entered ? 'vfb-enter' : ''}`}
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
        {metrics.length > 1 ? (
          <div className="flex -space-x-px">
            {metrics.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetricKey(m.key)}
                className={`${seg} first:rounded-l-[5px] last:rounded-r-[5px] ${m.key === metric.key ? segActive : segIdle}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="ml-auto flex items-center gap-4">
          {meta ? <p className="text-[13.5px] text-[var(--vz-text3,#5C5C5C)]">{meta}</p> : null}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              className={`${seg} rounded-[5px] ${segIdle}`}
            >
              {modelsLabel} ({visible.length}/{models.length}) <span aria-hidden>&#x2304;</span>
            </button>
            {menuOpen ? (
              <div className="vfb-pop absolute right-0 z-10 mt-1 max-h-72 w-60 origin-top-right overflow-auto rounded-[5px] border border-[var(--vz-frame,#E3E3E3)] bg-[var(--vz-surface,#fff)] py-1 shadow-sm">
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
                      style={{ backgroundColor: m.color }}
                    />
                    {m.id}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* plot area */}
      <div className="relative mt-4 rounded-[6px] border border-[var(--vz-frame,#E3E3E3)] bg-[var(--vz-surface,#fff)] p-2 md:p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`${title} vs ${metric.axisLabel}`}
          onMouseLeave={() => {
            setHover(null)
            setFocusId(null)
          }}
        >
          <text
            x={PAD.left + 12}
            y={PAD.top - 24}
            fontSize="16"
            fontWeight="700"
            fill="var(--vz-ink,#111)"
          >
            {title}
          </text>
          <text
            x={W - PAD.right - 12}
            y={PAD.top + 22}
            textAnchor="end"
            fontSize="13"
            fontStyle="italic"
            fill="var(--vz-muted,#8A8A8A)"
          >
            {efficientNote}
          </text>

          {/* grid + ticks */}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line
                x1={PAD.left}
                y1={sy(t)}
                x2={W - PAD.right}
                y2={sy(t)}
                stroke={t === 0 ? 'var(--vz-axis,#D9D9D9)' : 'var(--vz-grid,#EDEDED)'}
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={sy(t) + 4}
                textAnchor="end"
                fontSize="12.5"
                fill="var(--vz-muted2,#9C9C9C)"
              >
                {t}
                {yTickSuffix}
              </text>
            </g>
          ))}
          <g key={`ticks-${version.key}-${metric.key}`} className="vfb-fadein">
            {xTicks.map((t) => (
              <g key={`x${t}`}>
                <line
                  x1={sx(t)}
                  y1={PAD.top}
                  x2={sx(t)}
                  y2={H - PAD.bottom}
                  stroke="var(--vz-grid,#EDEDED)"
                  strokeWidth="1"
                />
                <text
                  x={sx(t)}
                  y={H - PAD.bottom + 22}
                  textAnchor="middle"
                  fontSize="12.5"
                  fill="var(--vz-muted2,#9C9C9C)"
                >
                  {fmt(t)}
                </text>
              </g>
            ))}
            <text
              x={PAD.left + PLOT_W / 2}
              y={H - PAD.bottom + 48}
              textAnchor="middle"
              fontSize="14"
              fill="var(--vz-text2,#3A3A3A)"
            >
              {metric.axisLabel}
            </text>
          </g>
          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT_W}
            height={PLOT_H}
            fill="none"
            stroke="var(--vz-frame,#E3E3E3)"
            strokeWidth="1"
          />

          {/* frontier lines: one model's points by descending X */}
          {visible.map((m, mi) => {
            const pts = [...m.runs]
              .sort((a, b) => (b.x[metric.key] ?? 0) - (a.x[metric.key] ?? 0))
              .map((run) => ({ px: sx(run.x[metric.key] ?? 0), py: sy(run.score) }))
            if (pts.length < 2) return null
            const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.px},${p.py}`).join(' ')
            const focused = focusId === m.id
            const isSubject = subjectId === m.id && focusId === null
            return (
              <g key={`line-${m.id}`} className="vfb-grp" opacity={dimmed(m.id)}>
                <path
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke={m.color}
                  strokeWidth={focused || isSubject ? 3 : 2}
                  strokeOpacity={focused ? 0.9 : isSubject ? 0.85 : 0.45}
                  className="vfb-line vfb-draw"
                  style={{
                    d: `path("${d}")`,
                    color: m.color,
                    ['--vfb-d' as string]: `${mi * 90}ms`,
                  }}
                />
                {/* invisible wide hover zone along the line */}
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={14}
                  className="vfb-line"
                  style={{ d: `path("${d}")` }}
                  onMouseEnter={() => setFocusId(m.id)}
                />
              </g>
            )
          })}

          {/* labels (under the points, so points stay clickable on top) */}
          {visible.map((m) =>
            m.runs
              .filter((run) => run.labeled)
              .map((run) => {
                const cx = sx(run.x[metric.key] ?? 0)
                const cy = sy(run.score)
                const text = `${m.id}${run.variant ? ` [${run.variant}]` : ''}`
                const manual = run.labelDx != null || run.labelDy != null
                const anchorEnd = manual ? (run.labelDx ?? 0) < 0 : cx > PAD.left + PLOT_W * 0.55
                const dx = run.labelDx ?? (anchorEnd ? -12 : 12)
                const dy = run.labelDy ?? 5
                // leader line to the point — only when the label sits far away
                const far = Math.abs(dy - 5) > 12 || Math.abs(dx) > 30
                return (
                  <g
                    key={`label-${m.id}-${run.variant ?? 'solo'}`}
                    className="vfb-move vfb-grp"
                    style={{ transform: `translate(${cx}px, ${cy}px)` }}
                    opacity={dimmed(m.id)}
                    pointerEvents="none"
                  >
                    {manual && far ? (
                      <line
                        x1={0}
                        y1={0}
                        x2={r2(dx + (anchorEnd ? 4 : -4))}
                        y2={r2(dy - 5)}
                        stroke={m.color}
                        strokeWidth="1"
                        strokeOpacity="0.6"
                      />
                    ) : null}
                    <text
                      x={dx}
                      y={dy}
                      textAnchor={anchorEnd ? 'end' : 'start'}
                      fontSize={subjectId === m.id ? '17' : '13.5'}
                      fontWeight="700"
                      fill={m.color}
                      style={subjectId === m.id ? { color: m.color } : undefined}
                    >
                      {text}
                    </text>
                    {run.isDefault ? (
                      <text
                        x={dx}
                        y={r2(dy + 15)}
                        textAnchor={anchorEnd ? 'end' : 'start'}
                        fontSize="11.5"
                        fill={m.color}
                        fillOpacity="0.55"
                      >
                        {defaultNote}
                      </text>
                    ) : null}
                  </g>
                )
              })
          )}

          {/* points; the subject gets a bigger dot with a ring of its color
              and a strong glow (the "where is our model" highlight must read
              even for single-run families that have no line) */}
          {visible.map((m, mi) =>
            m.runs.map((run, ri) => {
              const cx = sx(run.x[metric.key] ?? 0)
              const cy = sy(run.score)
              const isSubject = subjectId === m.id
              const sub = `${run.score}${yTickSuffix} · ${fmt(run.x[metric.key] ?? 0)}${run.isDefault ? ` · ${defaultNote}` : ''}`
              return (
                <g
                  key={`pt-${m.id}-${run.variant ?? 'solo'}`}
                  className="vfb-move vfb-pt vfb-grp"
                  style={{ transform: `translate(${cx}px, ${cy}px)` }}
                  opacity={dimmed(m.id)}
                  onMouseEnter={() => {
                    setFocusId(m.id)
                    setHover({
                      cx,
                      cy,
                      text: `${m.id}${run.variant ? ` [${run.variant}]` : ''}`,
                      sub,
                    })
                  }}
                  onMouseLeave={() => setHover(null)}
                >
                  {isSubject ? (
                    <>
                      <circle r="16" fill={m.color} fillOpacity="0.12" style={{ color: m.color }} />
                      <circle
                        r="12"
                        fill="none"
                        stroke={m.color}
                        strokeWidth="2"
                        strokeOpacity="0.95"
                        style={{ color: m.color }}
                      />
                    </>
                  ) : null}
                  <circle
                    r={isSubject ? 8 : 6}
                    fill={m.color}
                    stroke="var(--vz-ring,#fff)"
                    strokeWidth="1.5"
                    className="vfb-dot"
                    style={{ color: m.color, ['--vfb-d' as string]: `${mi * 90 + ri * 45}ms` }}
                  />
                </g>
              )
            })
          )}
        </svg>

        {hover ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `${r2((hover.cx / W) * 100)}%`,
              top: `${r2((hover.cy / H) * 100 - 2)}%`,
            }}
          >
            <div className="vfb-pop rounded-[4px] bg-[var(--vz-chip,#111)] px-2.5 py-1.5 text-[var(--vz-chip-ink,#fff)]">
              <p className="whitespace-nowrap text-[12px] font-semibold leading-tight">
                {hover.text}
              </p>
              <p className="whitespace-nowrap text-[11px] leading-tight text-[var(--vz-chip-ink,#fff)] opacity-60">
                {hover.sub}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
