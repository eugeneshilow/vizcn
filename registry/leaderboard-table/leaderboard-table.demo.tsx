import { LeaderboardBars } from './leaderboard-table'
import type { LeaderboardModel } from './leaderboard-table'

/**
 * Demo: three models across two dataset versions (toggle to see the rows
 * morph), each with several effort levels — switch to "All effort levels"
 * to expand them. Deterministic neutral data.
 */

const MODELS_V1: LeaderboardModel[] = [
  {
    id: 'atlas-4',
    badge: 'A',
    runs: [
      { variant: 'high', score: 64.2, std: 1.8, x: { cost: 18.4, tokens: 128, steps: 52 } },
      { variant: 'medium', score: 61.8, std: 1.4, x: { cost: 9.6, tokens: 74, steps: 41 } },
      { variant: 'low', score: 55.1, std: 2.1, x: { cost: 4.2, tokens: 38, steps: 29 } },
    ],
  },
  {
    id: 'nova-3.5',
    badge: 'N',
    runs: [
      { variant: 'high', score: 58.7, std: 2.3, x: { cost: 14.1, tokens: 102, steps: 47 } },
      { variant: 'low', score: 49.3, std: 1.9, x: { cost: 5.8, tokens: 44, steps: 33 } },
    ],
  },
  {
    id: 'orion-2',
    badge: 'O',
    runs: [
      { variant: 'high', score: 52.4, std: 2.6, x: { cost: 11.2, tokens: 88, steps: 44 } },
      { variant: 'low', score: 44.6, std: 2.2, x: { cost: 3.9, tokens: 31, steps: 26 } },
    ],
  },
]

const MODELS_V2: LeaderboardModel[] = [
  {
    id: 'atlas-4',
    badge: 'A',
    runs: [
      { variant: 'high', score: 67.9, std: 1.6, x: { cost: 16.8, tokens: 119, steps: 49 } },
      { variant: 'medium', score: 64.4, std: 1.3, x: { cost: 8.9, tokens: 68, steps: 38 } },
      { variant: 'low', score: 57.6, std: 1.9, x: { cost: 3.8, tokens: 34, steps: 27 } },
    ],
  },
  {
    id: 'nova-3.5',
    badge: 'N',
    runs: [
      { variant: 'high', score: 62.3, std: 2.0, x: { cost: 13.2, tokens: 95, steps: 45 } },
      { variant: 'low', score: 52.7, std: 1.7, x: { cost: 5.1, tokens: 40, steps: 31 } },
    ],
  },
  {
    id: 'orion-2',
    badge: 'O',
    runs: [
      { variant: 'high', score: 55.8, std: 2.4, x: { cost: 10.4, tokens: 81, steps: 42 } },
      { variant: 'low', score: 47.2, std: 2.0, x: { cost: 3.5, tokens: 28, steps: 24 } },
    ],
  },
]

export default function LeaderboardTableDemo() {
  return (
    <LeaderboardBars
      meta="120 tasks · updated Jun 12, 2026"
      footnote="All runs executed on the same harness with a 100-step budget; cost is the average per solved task."
      versions={[
        { key: 'v1', label: 'v1.0', models: MODELS_V1 },
        { key: 'v2', label: 'v1.1', models: MODELS_V2 },
      ]}
      columns={[
        { key: 'cost', label: 'cost', prefix: '$', decimals: 2 },
        { key: 'tokens', label: 'tokens', suffix: 'k' },
        { key: 'steps', label: 'steps' },
      ]}
    />
  )
}
