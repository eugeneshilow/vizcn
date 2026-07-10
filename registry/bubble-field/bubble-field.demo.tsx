import { seriesColor } from '../../lib/palette'
import { BubbleField, type BubblePoint } from './bubble-field'

// Neutral, deterministic demo: fictional models spread across two log axes.
// Series are generic capability domains; each domain gets a stable palette hue.
const SERIES = ['Reasoning', 'Coding', 'Math', 'Vision'] as const
const hue = (s: (typeof SERIES)[number]) => seriesColor(SERIES.indexOf(s))

const points: BubblePoint[] = [
  { label: 'Atlas', series: 'Reasoning', color: hue('Reasoning'), x: 16486, y: 454, size: 9 },
  { label: 'Nova', series: 'Reasoning', color: hue('Reasoning'), x: 5779, y: 2599, size: 4 },
  { label: 'Orion', series: 'Coding', color: hue('Coding'), x: 34792, y: 3258, size: 8 },
  { label: 'Vega', series: 'Math', color: hue('Math'), x: 76076, y: 2125, size: 2 },
  { label: 'Lumen', series: 'Vision', color: hue('Vision'), x: 36646, y: 392, size: 2 },
]

export default function BubbleFieldDemo() {
  return (
    <BubbleField
      xLabel="Popularity (stars)"
      yLabel="Files in snapshot"
      legendUnit="tasks"
      points={points}
    />
  )
}
