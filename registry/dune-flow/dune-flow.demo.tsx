'use client'

import { RAMP } from '../../lib/palette'
import { DuneAreaChart } from './dune-flow'

/**
 * Demo: open evaluation tasks by priority over six weeks — an ORDINAL
 * series (Low → Medium → High), so it uses the single-hue RAMP instead of
 * categorical hues. Data is deterministic (smooth waves, no randomness).
 */

const N = 42
const START = Date.UTC(2026, 0, 5) // 2026-01-05
const DAY_MS = 86_400_000

const days = Array.from({ length: N }, (_, i) =>
  new Date(START + i * DAY_MS).toISOString().slice(0, 10)
)

const wave = (i: number, base: number, amp: number, period: number, phase: number) =>
  Math.round(base + amp * Math.sin((i / period) * Math.PI * 2 + phase) + (amp / 3) * Math.sin(i / 2.7 + phase))

const low = Array.from({ length: N }, (_, i) => wave(i, 34, 12, 21, 0.4))
const medium = Array.from({ length: N }, (_, i) => wave(i, 22, 9, 17, 2.1))
const high = Array.from({ length: N }, (_, i) => Math.max(0, wave(i, 10, 8, 14, 4.2)))

export default function DuneFlowDemo() {
  return (
    <DuneAreaChart
      days={days}
      series={[
        { label: 'Low', color: RAMP[0], values: low },
        { label: 'Medium', color: RAMP[1], values: medium },
        { label: 'High', color: RAMP[2], values: high },
      ]}
      yLabel="Open evaluation tasks by priority"
    />
  )
}
