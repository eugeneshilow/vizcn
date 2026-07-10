'use client'

import { seriesColor } from '../../lib/palette'
import { StackedActivityBars, type StackSegment } from './stacked-activity'

/**
 * Demo: 28 days of token traffic for the fictional model "Atlas" —
 * deterministic waves (no randomness), stacked as prompt / completion /
 * reasoning tokens. The last day is partial and hatched.
 */

const N = 28

function isoDays(startIso: string, count: number): string[] {
  const d = new Date(`${startIso}T00:00:00Z`)
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return out
}

const days = isoDays('2025-06-01', N)

const wave = (i: number, base: number, a1: number, a2: number) =>
  Math.round((base + a1 * Math.sin(i / 3.1) + a2 * Math.sin(i / 1.4 + 1.7) + i * 0.06) * 100) / 100

const prompt = days.map((_, i) => wave(i, 5.8, 1.6, 0.7))
const completion = days.map((_, i) => wave(i, 2.4, 0.8, 0.4))
const reasoning = days.map((_, i) => wave(i, 1.1, 0.5, 0.25))

// last day is in progress — scale it down to look partial
const partial = (vs: number[]) => vs.map((v, i) => (i === N - 1 ? Math.round(v * 42) / 100 : v))

const segments: StackSegment[] = [
  { key: 'prompt', label: 'Prompt', color: seriesColor(0), values: partial(prompt) },
  { key: 'completion', label: 'Completion', color: seriesColor(1), values: partial(completion) },
  { key: 'reasoning', label: 'Reasoning', color: seriesColor(2), values: partial(reasoning) },
]

export default function StackedActivityDemo() {
  return (
    <StackedActivityBars
      days={days}
      segments={segments}
      unit="B"
      note="Daily token volume for Atlas by request part. Hover a day to pin it in the legend."
      partialLast
      partialNote="partial day"
    />
  )
}
