import { LeaderboardBars } from './leaderboard-table'
import type { LeaderboardModel, LeaderboardRun } from './leaderboard-table'
import { seriesColor } from '../../lib/palette'

/**
 * Demo: dense fictional leaderboard — 8 models with effort-level runs
 * across two dataset versions (toggle to see rows morph; "All effort
 * levels" expands the runs). Same data rail as the frontier-board demo:
 * one dataset feeds both forms. Deterministic data.
 */

const lr = (
  variant: string | undefined,
  cost: number,
  score: number,
  extra?: Partial<LeaderboardRun>,
): LeaderboardRun => {
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

const V11: LeaderboardModel[] = [
  {
    id: 'atlas-4',
    color: seriesColor(0),
    runs: [
      lr('max', 21.6, 70.4, { std: 4, x: { tokens: 119, steps: 88 } }),
      lr('high', 13.4, 70.0),
      lr('medium', 9.3, 68.7),
      lr('low', 6.2, 65.3),
      lr('minimal', 3.7, 59.6),
    ],
  },
  {
    id: 'nova-3.5',
    color: seriesColor(1),
    runs: [
      lr('max', 13.2, 59.1, { x: { tokens: 135, steps: 120 } }),
      lr('xhigh', 8.0, 54.3),
      lr('high', 4.3, 51.7),
      lr('medium', 3.5, 48.6),
      lr('low', 2.7, 40.8),
    ],
  },
  {
    id: 'orion-2',
    color: seriesColor(2),
    runs: [
      lr('max', 9.8, 56.9),
      lr('high', 6.4, 54.2),
      lr('medium', 4.1, 49.8),
      lr('low', 2.9, 43.5),
    ],
  },
  {
    id: 'helix-r1',
    color: seriesColor(3),
    runs: [lr('high', 7.4, 52.8), lr('medium', 4.8, 47.9), lr('low', 3.2, 41.2)],
  },
  {
    id: 'vega-1',
    color: seriesColor(4),
    runs: [lr('high', 5.6, 48.3), lr('medium', 3.6, 43.1), lr('low', 2.4, 36.4)],
  },
  {
    id: 'quasar-72b',
    color: seriesColor(5),
    runs: [lr('high', 4.9, 44.7), lr('medium', 3.1, 39.8), lr('low', 2.2, 33.9)],
  },
  {
    id: 'lumen-mini',
    color: seriesColor(6),
    runs: [lr('high', 2.9, 38.4), lr('medium', 2.1, 33.7), lr('low', 1.6, 27.8)],
  },
  {
    id: 'sol-8b',
    color: seriesColor(7),
    runs: [lr('high', 2.3, 31.2), lr('low', 1.7, 25.1)],
  },
]

/** v1.0 — the previous dataset: one model fewer, scores a notch lower. */
const V10: LeaderboardModel[] = V11.filter((m) => m.id !== 'sol-8b').map((m) => ({
  ...m,
  runs: m.runs.map((r) => ({
    ...r,
    score: Math.round((r.score - 4.2) * 10) / 10,
    x: { ...r.x, cost: Math.round(r.x.cost * 0.92 * 100) / 100 },
  })),
}))

export default function LeaderboardTableDemo() {
  return (
    <LeaderboardBars
      meta="128 tasks · updated Jun 12, 2026"
      footnote="All runs executed on the same harness with a 100-step budget; cost is the average per solved task."
      versions={[
        { key: 'v1.1', label: 'v1.1', models: V11 },
        { key: 'v1.0', label: 'v1.0', models: V10 },
      ]}
      columns={[
        { key: 'cost', label: 'cost', prefix: '$', decimals: 2 },
        { key: 'tokens', label: 'tokens', suffix: 'k' },
        { key: 'steps', label: 'steps' },
      ]}
    />
  )
}
