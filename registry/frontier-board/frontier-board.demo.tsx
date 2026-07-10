import { FrontierBoard } from './frontier-board'
import type { FrontierModel, FrontierRun } from './frontier-board'
import { seriesColor } from '../../lib/palette'

/**
 * Demo: fictional models with real-leaderboard density — 10 models across
 * five fictional vendors, effort-level runs (minimal→max), two dataset
 * versions, labeled defaults. Values mirror the density of real coding
 * leaderboards; every name is invented. Deterministic data.
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
    badge: 'M',
    runs: [
      fr('max', 21.63, 70.4, { std: 4, x: { tokens: 119, steps: 88 } }),
      fr('high', 13.4, 70, { labeled: true, isDefault: true, labelDx: -14, labelDy: 44 }),
      fr('medium', 9.3, 68.7),
      fr('low', 6.2, 65.3),
      fr('minimal', 3.7, 59.6),
    ],
  },
  {
    id: 'atlas-3.5',
    color: seriesColor(0),
    badge: 'M',
    runs: [
      fr('max', 13.22, 59.1, { x: { tokens: 135, steps: 120 } }),
      fr('xhigh', 8.0, 54.3),
      fr('high', 4.3, 51.7, { labeled: true, isDefault: true, labelDx: 6, labelDy: 42 }),
      fr('medium', 3.5, 48.6),
      fr('low', 2.7, 40.8),
    ],
  },
  {
    id: 'atlas-3',
    color: seriesColor(0),
    badge: 'M',
    runs: [
      fr('max', 26.4, 54, {
        labeled: true,
        isDefault: true,
        std: 4,
        x: { tokens: 214, steps: 268 },
      }),
      fr('xhigh', 11.9, 49.7),
      fr('high', 8.3, 48.3),
      fr('medium', 4.4, 39.9),
      fr('low', 2.3, 30.5),
    ],
  },
  {
    id: 'atlas-2',
    color: seriesColor(0),
    badge: 'M',
    runs: [fr('high', 5.52, 30.2, { labeled: true, std: 4, x: { tokens: 76, steps: 134 } })],
  },
  {
    id: 'nova-5',
    color: seriesColor(1),
    badge: 'H',
    runs: [
      fr('xhigh', 7.23, 67.1, { std: 6, x: { tokens: 46, steps: 82 } }),
      fr('high', 4.9, 64.4),
      fr('medium', 2.6, 53.9, { labeled: true }),
      fr('low', 1.2, 27.2),
    ],
  },
  {
    id: 'nova-4',
    color: seriesColor(1),
    badge: 'H',
    runs: [fr('xhigh', 5.65, 51.7, { labeled: true, labelDx: 16, labelDy: 20, x: { tokens: 71, steps: 70 } })],
  },
  {
    id: 'orion-72b',
    color: seriesColor(2),
    badge: 'V',
    runs: [
      fr('max', 3.92, 43.7, { labeled: true, isDefault: true, x: { tokens: 78, steps: 129 } }),
      fr('high', 2.9, 36.3),
    ],
  },
  {
    id: 'vega-flash',
    color: seriesColor(3),
    badge: 'S',
    runs: [fr('medium', 7.34, 37.2, { labeled: true, x: { tokens: 276, steps: 86 } })],
  },
  {
    id: 'vega-pro',
    color: seriesColor(3),
    badge: 'S',
    runs: [fr('high', 9.48, 11.8, { labeled: true, labelDx: 14, x: { tokens: 196, steps: 81 } })],
  },
  {
    id: 'quasar-coder',
    color: seriesColor(5),
    badge: 'Q',
    runs: [
      fr(undefined, 2.82, 30.7, {
        labeled: true,
        labelDx: -6,
        labelDy: -24,
        std: 1,
        x: { tokens: 59, steps: 149 },
      }),
    ],
  },
]

/** v1 — the previous snapshot: a notch lower and cheaper, two models fewer. */
const V1: FrontierModel[] = V11.filter(
  (m) => m.id !== 'orion-72b' && m.id !== 'quasar-coder',
).map((m) => ({
  ...m,
  runs: m.runs.map((run) => ({
    ...run,
    score: Math.round((run.score - 4.5) * 10) / 10,
    x: {
      cost: Math.round(run.x.cost * 92) / 100,
      tokens: Math.round(run.x.tokens * 0.92),
      steps: Math.round(run.x.steps * 0.92),
    },
  })),
}))

const VERSIONS = [
  { key: 'v1.1', label: 'v1.1', models: V11 },
  { key: 'v1', label: 'v1', models: V1 },
]

const METRICS = [
  { key: 'cost', label: 'Price', axisLabel: 'Avg cost per task', tickPrefix: '$' },
  { key: 'tokens', label: 'Output tokens', axisLabel: 'Avg output tokens per task, k', tickSuffix: 'k' },
  { key: 'steps', label: 'Agent steps', axisLabel: 'Avg agent steps per task' },
]

/** Primary: ascending X axis (Artificial Analysis genre). */
export default function FrontierBoardDemo() {
  return (
    <FrontierBoard
      title="Agentic coding score"
      versions={VERSIONS}
      metrics={METRICS}
      yMax={80}
      meta="113 tasks · updated Jul 1, 2026"
      xAscending
    />
  )
}

/** Second axis genre: inverted X (DeepSWE style — cheaper to the right). */
export function InvertedDemo() {
  return (
    <FrontierBoard
      title="Agentic coding score"
      versions={VERSIONS}
      metrics={METRICS}
      yMax={80}
      meta="113 tasks · updated Jul 1, 2026"
    />
  )
}
