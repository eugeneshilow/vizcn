import { seriesColor } from '../../lib/palette'
import {
  BenchMatrix,
  type BenchMatrixGroup,
  type BenchMatrixModel,
} from './bench-matrix'

/**
 * Deterministic, brand-neutral demo of BenchMatrix.
 * Invented models (Atlas / Nova / Orion) and domains (Reasoning / Coding /
 * Agentic) — no real vendors or benchmarks. The hero column (Nova 2) is tinted
 * with a categorical hue from ./palette.
 */

const models: BenchMatrixModel[] = [
  { id: 'atlas', label: 'Atlas 3', vendor: 'Meridian', color: seriesColor(0) },
  {
    id: 'nova',
    label: 'Nova 2 (max)',
    vendor: 'Helix Labs',
    color: seriesColor(1),
    hero: true,
  },
  { id: 'orion', label: 'Orion Pro', vendor: 'Vantage', color: seriesColor(2) },
]

const groups: BenchMatrixGroup[] = [
  {
    label: 'reasoning',
    rows: [
      {
        bench: 'Deductive Suite',
        note: 'multi-step logic under constraints',
        values: [71.4, 78.2, 74.9],
      },
      {
        bench: 'Long-Context Recall',
        note: 'needle retrieval at 128k tokens',
        values: [88.0, 92.5, 90.1],
      },
      {
        bench: 'Abstract Puzzles',
        note: 'novel visual-symbolic tasks',
        values: [43.7, 51.0, 49.2],
      },
    ],
  },
  {
    label: 'coding',
    rows: [
      {
        bench: 'Repo Fix Rate',
        note: 'patches passing the full test suite',
        values: [54.3, 63.8, 61.2],
      },
      {
        bench: 'Function Synthesis',
        note: 'spec → correct implementation',
        values: [79.5, 84.1, 82.7],
      },
    ],
  },
  {
    label: 'agentic',
    rows: [
      {
        bench: 'Tool Trajectory',
        note: 'end-to-end task via API tools',
        values: [38.0, 47.6, 44.3],
      },
      {
        bench: 'Web Navigation',
        note: 'goal completion across sites',
        values: [29.4, 35.2, null],
      },
    ],
  },
]

export default function BenchMatrixDemo() {
  return (
    <BenchMatrix
      models={models}
      groups={groups}
      meta="7 benchmarks · snapshot"
      footnote="Demo data — invented models and benchmarks, deterministic values."
      decimals={1}
      benchColLabel="benchmark"
    />
  )
}
