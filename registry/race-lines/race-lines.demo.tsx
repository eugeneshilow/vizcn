'use client'

import { ActivityLineChart, type ActivitySeries } from './race-lines'

/**
 * Demo: daily token throughput for three models over 30 days.
 * Deterministic synthetic data (waves + trend); Nova has a two-day
 * reporting gap to show null-bridging.
 */

const DAYS = Array.from(
  { length: 30 },
  (_, i) => `2025-06-${String(i + 1).padStart(2, '0')}`
)

function wave(i: number, base: number, trend: number, amp: number, phase: number): number {
  return Math.round(base + i * trend + amp * Math.sin(i / 3.2 + phase) + amp * 0.4 * Math.sin(i / 1.7 + phase * 2))
}

const SERIES: ActivitySeries[] = [
  {
    label: 'Atlas',
    values: DAYS.map((_, i) => wave(i, 4_200_000, 95_000, 420_000, 0.6)),
    legendValue: '7.1M/day',
    highlight: true,
  },
  {
    label: 'Nova',
    values: DAYS.map((_, i) =>
      i === 11 || i === 12 ? null : wave(i, 3_400_000, 40_000, 360_000, 2.1)
    ),
    legendValue: '4.6M/day',
  },
  {
    label: 'Orion',
    values: DAYS.map((_, i) => wave(i, 2_100_000, -18_000, 280_000, 4.0)),
    legendValue: '1.6M/day',
  },
]

export default function RaceLinesDemo() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <ActivityLineChart days={DAYS} series={SERIES} yLabel="Tokens processed per day" />
    </div>
  )
}
