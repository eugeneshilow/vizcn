import { FrontierBoard } from './frontier-board'
import type { FrontierModel } from './frontier-board'

/**
 * Demo: five models on a score x cost frontier, two dataset versions
 * (toggle to see the morph) and two X metrics. Deterministic neutral data.
 * AADemo shows the second axis genre (xAscending: expensive to the right,
 * efficient corner up-and-left).
 */

const MODELS_V1: FrontierModel[] = [
  {
    id: 'atlas-4',
    runs: [
      { variant: 'high', score: 64.2, x: { cost: 18.4, tokens: 128 }, labeled: true },
      { variant: 'medium', score: 61.8, x: { cost: 9.6, tokens: 74 }, isDefault: true },
      { variant: 'low', score: 55.1, x: { cost: 4.2, tokens: 38 } },
    ],
  },
  {
    id: 'nova-3.5',
    runs: [
      { variant: 'high', score: 58.7, x: { cost: 14.1, tokens: 102 }, labeled: true },
      { variant: 'low', score: 49.3, x: { cost: 5.8, tokens: 44 } },
    ],
  },
  {
    id: 'orion-2',
    runs: [
      { variant: 'high', score: 52.4, x: { cost: 11.2, tokens: 88 }, labeled: true, labelDy: -14 },
      { variant: 'low', score: 44.6, x: { cost: 3.9, tokens: 31 } },
    ],
  },
  {
    id: 'vega-1',
    runs: [{ score: 38.2, x: { cost: 2.4, tokens: 22 }, labeled: true, isDefault: true }],
  },
  {
    id: 'lumen-mini',
    runs: [
      { variant: 'high', score: 41.5, x: { cost: 3.1, tokens: 27 }, labeled: true, labelDy: 22 },
      { variant: 'low', score: 33.8, x: { cost: 1.3, tokens: 12 } },
    ],
  },
]

const MODELS_V2: FrontierModel[] = [
  {
    id: 'atlas-4',
    runs: [
      { variant: 'high', score: 67.9, x: { cost: 16.8, tokens: 119 }, labeled: true },
      { variant: 'medium', score: 64.4, x: { cost: 8.9, tokens: 68 }, isDefault: true },
      { variant: 'low', score: 57.6, x: { cost: 3.8, tokens: 34 } },
    ],
  },
  {
    id: 'nova-3.5',
    runs: [
      { variant: 'high', score: 62.3, x: { cost: 13.2, tokens: 95 }, labeled: true },
      { variant: 'low', score: 52.7, x: { cost: 5.1, tokens: 40 } },
    ],
  },
  {
    id: 'orion-2',
    runs: [
      { variant: 'high', score: 55.8, x: { cost: 10.4, tokens: 81 }, labeled: true, labelDy: -14 },
      { variant: 'low', score: 47.2, x: { cost: 3.5, tokens: 28 } },
    ],
  },
  {
    id: 'vega-1',
    runs: [{ score: 41.9, x: { cost: 2.1, tokens: 19 }, labeled: true, isDefault: true }],
  },
  {
    id: 'lumen-mini',
    runs: [
      { variant: 'high', score: 45.3, x: { cost: 2.8, tokens: 24 }, labeled: true, labelDy: 22 },
      { variant: 'low', score: 36.4, x: { cost: 1.1, tokens: 10 } },
    ],
  },
]

export default function FrontierBoardDemo() {
  return (
    <FrontierBoard
      title="Agentic coding score"
      meta="120 tasks · updated Jun 12, 2026"
      subjectId="atlas-4"
      versions={[
        { key: 'v1', label: 'v1.0', models: MODELS_V1 },
        { key: 'v2', label: 'v1.1', models: MODELS_V2 },
      ]}
      metrics={[
        { key: 'cost', label: 'Price', axisLabel: 'Avg cost per task', tickPrefix: '$' },
        { key: 'tokens', label: 'Tokens', axisLabel: 'Avg output tokens per task, k', tickSuffix: 'k' },
      ]}
    />
  )
}

/** Second axis genre: ascending cost axis (expensive right, efficient corner ↖). */
export function AADemo() {
  return (
    <FrontierBoard
      title="Agentic coding score"
      meta="120 tasks · updated Jun 12, 2026"
      subjectId="atlas-4"
      xAscending
      versions={[{ key: 'v2', label: 'v1.1', models: MODELS_V2 }]}
      metrics={[{ key: 'cost', label: 'Price', axisLabel: 'Avg cost per task', tickPrefix: '$' }]}
    />
  )
}
