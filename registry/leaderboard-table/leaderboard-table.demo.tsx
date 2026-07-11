import { LeaderboardBars } from './leaderboard-table'
import type { LeaderboardModel, LeaderboardRun } from './leaderboard-table'

// vendor identity colors (color follows the entity): a vivid set that
// holds on both light and dark surfaces — same rail as frontier-board
const FAMILY_COLOR = {
  atlas: '#E8734A',
  nova: '#10A37F',
  orion: '#4285F4',
  vega: '#D946EF',
  quasar: '#5B6EE1',
} as const

/**
 * Demo: fictional models with real-leaderboard density — the same data
 * rail as the frontier-board demo (one dataset feeds both forms). Every
 * name is invented; values mirror real coding-leaderboard density.
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
    color: FAMILY_COLOR.atlas,
    badge: 'M',
    runs: [
      lr('max', 21.63, 70.4, { std: 4, x: { tokens: 119, steps: 88 } }),
      lr('high', 13.4, 70),
      lr('medium', 9.3, 68.7),
      lr('low', 6.2, 65.3),
      lr('minimal', 3.7, 59.6),
    ],
  },
  {
    id: 'atlas-3.5',
    color: FAMILY_COLOR.atlas,
    badge: 'M',
    runs: [
      lr('max', 13.22, 59.1, { x: { tokens: 135, steps: 120 } }),
      lr('xhigh', 8.0, 54.3),
      lr('high', 4.3, 51.7),
      lr('medium', 3.5, 48.6),
      lr('low', 2.7, 40.8),
    ],
  },
  {
    id: 'atlas-3',
    color: FAMILY_COLOR.atlas,
    badge: 'M',
    runs: [
      lr('max', 26.4, 54, { std: 4, x: { tokens: 214, steps: 268 } }),
      lr('xhigh', 11.9, 49.7),
      lr('high', 8.3, 48.3),
      lr('medium', 4.4, 39.9),
      lr('low', 2.3, 30.5),
    ],
  },
  {
    id: 'atlas-2',
    color: FAMILY_COLOR.atlas,
    badge: 'M',
    runs: [lr('high', 5.52, 30.2, { std: 4, x: { tokens: 76, steps: 134 } })],
  },
  {
    id: 'nova-5',
    color: FAMILY_COLOR.nova,
    badge: 'H',
    runs: [
      lr('xhigh', 7.23, 67.1, { std: 6, x: { tokens: 46, steps: 82 } }),
      lr('high', 4.9, 64.4),
      lr('medium', 2.6, 53.9),
      lr('low', 1.2, 27.2),
    ],
  },
  {
    id: 'nova-4',
    color: FAMILY_COLOR.nova,
    badge: 'H',
    runs: [lr('xhigh', 5.65, 51.7, { x: { tokens: 71, steps: 70 } })],
  },
  {
    id: 'orion-72b',
    color: FAMILY_COLOR.orion,
    badge: 'V',
    runs: [
      lr('max', 3.92, 43.7, { x: { tokens: 78, steps: 129 } }),
      lr('high', 2.9, 36.3),
    ],
  },
  {
    id: 'vega-flash',
    color: FAMILY_COLOR.vega,
    badge: 'S',
    runs: [lr('medium', 7.34, 37.2, { x: { tokens: 276, steps: 86 } })],
  },
  {
    id: 'vega-pro',
    color: FAMILY_COLOR.vega,
    badge: 'S',
    runs: [lr('high', 9.48, 11.8, { x: { tokens: 196, steps: 81 } })],
  },
  {
    id: 'quasar-coder',
    color: FAMILY_COLOR.quasar,
    badge: 'Q',
    runs: [lr(undefined, 2.82, 30.7, { std: 1, x: { tokens: 59, steps: 149 } })],
  },
]

/** v1 — the previous snapshot: a notch lower and cheaper, two models fewer. */
const V1: LeaderboardModel[] = V11.filter(
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

export default function LeaderboardTableDemo() {
  return (
    <LeaderboardBars
      meta="113 tasks · updated Jul 1, 2026"
      footnote="All runs executed on the same harness with a 100-step budget; cost is the average per solved task. Fictional models, deterministic demo data."
      versions={[
        { key: 'v1.1', label: 'v1.1', models: V11 },
        { key: 'v1', label: 'v1', models: V1 },
      ]}
      columns={[
        { key: 'cost', label: 'cost', prefix: '$', decimals: 2 },
        { key: 'tokens', label: 'tokens', suffix: 'k' },
        { key: 'steps', label: 'steps' },
      ]}
    />
  )
}
