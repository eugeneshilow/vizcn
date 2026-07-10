'use client'

import { seriesColor } from '../../lib/palette'
import { BenchMatrix, type BenchMatrixGroup, type BenchMatrixModel } from './bench-matrix'

const models: BenchMatrixModel[] = [
  { id: 'atlas', label: 'Atlas 2 (max)', vendor: 'Meridian', color: seriesColor(0), hero: true },
  { id: 'nova', label: 'Nova Pro', vendor: 'Helix Labs' },
  { id: 'orion', label: 'Orion 1.5', vendor: 'Vantage' },
  { id: 'vega', label: 'Vega Ultra', vendor: 'Helix Labs' },
]

const groups: BenchMatrixGroup[] = [
  {
    label: 'reasoning',
    rows: [
      {
        bench: 'ReasonEval',
        note: 'graduate-level multi-step reasoning, no tools',
        values: [88.4, 86.1, 84.9, 87.2],
      },
      {
        bench: 'PuzzleBench Hard',
        note: 'constraint puzzles, pass@1',
        values: [71.3, 69.8, 64.2, 70.5],
      },
      {
        bench: 'LongContext QA',
        note: 'needle retrieval over 1M-token inputs',
        values: [92.6, 90.1, null, 91.4],
      },
    ],
  },
  {
    label: 'coding',
    rows: [
      {
        bench: 'RepoPatch Verified',
        note: 'real repository bug fixes, end-to-end',
        values: [74.8, 72.3, 70.6, 73.1],
      },
      {
        bench: 'CodeGolf Elite',
        note: 'competitive programming, percentile',
        values: [61.2, 63.7, 58.4, 60.9],
      },
    ],
  },
  {
    label: 'agentic',
    rows: [
      {
        bench: 'AgentOps Suite',
        note: 'multi-step tool use across 40 tasks',
        values: [67.5, 62.8, 59.3, 65.0],
      },
      {
        bench: 'BrowserQuest',
        note: 'autonomous web navigation, success rate',
        values: [54.1, 51.6, 47.2, 53.8],
      },
    ],
  },
]

export default function BenchMatrixDemo() {
  return (
    <BenchMatrix
      models={models}
      groups={groups}
      meta="7 benchmarks · snapshot Jul 9, 2026"
      footnote="Scores as reported by each vendor; dash = not published. Higher is better."
    />
  )
}
