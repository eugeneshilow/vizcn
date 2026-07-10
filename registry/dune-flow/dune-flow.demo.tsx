import { DuneAreaChart, type DuneSeries } from './dune-flow'
import { RAMP } from '../../lib/palette'

/**
 * Deterministic demo for DuneAreaChart.
 * Ordinal series (Low → Medium → High tier) use the single-hue RAMP so the
 * stack reads as an ordered scale, light at the bottom, dark on top.
 */

// 24 consecutive days, generated deterministically (no Date.now).
const days: string[] = Array.from({ length: 24 }, (_, i) => {
  const day = i + 1
  return `2024-03-${String(day).padStart(2, '0')}`
})

// Smooth, deterministic waves — a base plus a couple of sine humps per tier.
function wave(i: number, base: number, amp: number, phase: number, period: number): number {
  const v = base + amp * (0.5 + 0.5 * Math.sin((i / period) * Math.PI * 2 + phase))
  return Math.round(v)
}

const series: DuneSeries[] = [
  {
    label: 'Low tier',
    color: RAMP[0],
    values: days.map((_, i) => wave(i, 40, 26, 0.4, 11)),
  },
  {
    label: 'Medium tier',
    color: RAMP[1],
    values: days.map((_, i) => wave(i, 30, 34, 2.1, 8)),
  },
  {
    label: 'High tier',
    color: RAMP[2],
    values: days.map((_, i) => wave(i, 14, 20, 4.0, 13)),
  },
]

export default function DuneFlowDemo() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <DuneAreaChart days={days} series={series} yLabel="Events per day by tier" />
    </div>
  )
}
