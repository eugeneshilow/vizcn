import { FrontierBoard } from './frontier-board'
import type { FrontierModel, FrontierRun } from './frontier-board'
import { seriesColor } from '../../lib/palette'

/**
 * Demo: dense fictional leaderboard — 8 models, effort-level runs
 * (minimal→max), two dataset versions, labeled defaults. Mirrors the
 * density of real frontier boards (DeepSWE / Artificial Analysis genre).
 * AADemo shows the second axis genre (xAscending). Deterministic data.
 */

const fr = (
  variant: string | undefined,
  cost: number,
  score: number,
  extra?: Partial<FrontierRun>,
): FrontierRun => {
  const { x, ...rest } = extra ?? {}
  return {
    variant,
    score,
    std: 2,
    x: {
      cost,
      tokens: Math.round(cost * 6.8 + score * 0.4),
      steps: Math.round(cost * 2.2 + 14),
      ...x,
    },
    ...rest,
  }
}

const V11: FrontierModel[] = [
  {
    id: 'atlas-4',
    color: seriesColor(0),
    runs: [
      fr('max', 21.6, 70.4, { std: 4, x: { tokens: 119, steps: 88 } }),
      fr('high', 13.4, 70.0, { labeled: true, isDefault: true, labelDx: -14, labelDy: 44 }),
      fr('medium', 9.3, 68.7),
      fr('low', 6.2, 65.3),
      fr('minimal', 3.7, 59.6),
    ],
  },
  {
    id: 'nova-3.5',
    color: seriesColor(1),
    runs: [
      fr('max', 13.2, 59.1, { x: { tokens: 135, steps: 120 } }),
      fr('xhigh', 8.0, 54.3),
      fr('high', 4.3, 51.7, { labeled: true, isDefault: true, labelDx: 12, labelDy: 6 }),
      fr('medium', 3.5, 48.6),
      fr('low', 2.7, 40.8),
    ],
  },
  {
    id: 'orion-2',
    color: seriesColor(2),
    runs: [
      fr('max', 9.8, 56.9),
      fr('high', 6.4, 54.2, { labeled: true, isDefault: true, labelDx: 10, labelDy: -10 }),
      fr('medium', 4.1, 49.8),
      fr('low', 2.9, 43.5),
    ],
  },
  {
    id: 'helix-r1',
    color: seriesColor(3),
    runs: [
      fr('high', 7.4, 52.8, { labeled: true, isDefault: true, labelDx: 14, labelDy: 26 }),
      fr('medium', 4.8, 47.9),
      fr('low', 3.2, 41.2),
    ],
  },
  {
    id: 'vega-1',
    color: seriesColor(4),
    runs: [
      fr('high', 5.6, 48.3, { isDefault: true }),
      fr('medium', 3.6, 43.1),
      fr('low', 2.4, 36.4),
    ],
  },
  {
    id: 'quasar-72b',
    color: seriesColor(5),
    runs: [
      fr('high', 4.9, 44.7, { labeled: true, isDefault: true, labelDx: 12, labelDy: 18 }),
      fr('medium', 3.1, 39.8),
      fr('low', 2.2, 33.9),
    ],
  },
  {
    id: 'lumen-mini',
    color: seriesColor(6),
    runs: [
      fr('high', 2.9, 38.4, { labeled: true, isDefault: true, labelDx: 8, labelDy: -12 }),
      fr('medium', 2.1, 33.7),
      fr('low', 1.6, 27.8),
    ],
  },
  {
    id: 'sol-8b',
    color: seriesColor(7),
    runs: [
      fr('high', 2.3, 31.2, { labeled: true, isDefault: true, labelDx: -6, labelDy: 30 }),
      fr('low', 1.7, 25.1),
    ],
  },
]

/** v1.0 — the previous dataset: one model fewer, scores a notch lower. */
const V10: FrontierModel[] = V11.filter((m) => m.id !== 'sol-8b').map((m) => ({
  ...m,
  runs: m.runs.map((r) => ({
    ...r,
    score: Math.round((r.score - 4.2) * 10) / 10,
    x: { ...r.x, cost: Math.round(r.x.cost * 0.92 * 100) / 100 },
  })),
}))

const VERSIONS = [
  { key: 'v1.1', label: 'v1.1', models: V11 },
  { key: 'v1.0', label: 'v1.0', models: V10 },
]

const METRICS = [
  { key: 'cost', label: 'Price', axisLabel: 'Avg cost per task', tickPrefix: '$' },
  { key: 'tokens', label: 'Tokens', axisLabel: 'Avg output tokens per task, k', tickSuffix: 'k' },
  { key: 'steps', label: 'Steps', axisLabel: 'Avg steps per task' },
]

export default function FrontierBoardDemo() {
  return (
    <FrontierBoard
      title="Agentic coding score"
      versions={VERSIONS}
      metrics={METRICS}
      yMax={80}
      subjectId="atlas-4"
      meta="128 tasks · updated Jun 12, 2026"
    />
  )
}

/** Same board, ascending X axis (Artificial Analysis genre). */
export function AADemo() {
  return (
    <FrontierBoard
      title="Agentic coding score"
      versions={VERSIONS}
      metrics={METRICS}
      yMax={80}
      subjectId="atlas-4"
      meta="128 tasks · updated Jun 12, 2026"
      xAscending
    />
  )
}
