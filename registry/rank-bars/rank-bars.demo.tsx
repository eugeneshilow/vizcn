import { RankBarChart, type RankBarItem } from "./rank-bars"
import { seriesColor } from "../../lib/palette"

/**
 * Deterministic, brand-neutral demo for RankBarChart.
 * Generic model names on a single "Reasoning" score metric; one hero row.
 */
const items: RankBarItem[] = [
  { label: "Orion", value: 88, sub: "flagship tier", highlight: true },
  { label: "Atlas", value: 81, sub: "general purpose", color: seriesColor(1) },
  { label: "Nova", value: 74, sub: "balanced", color: seriesColor(2) },
  { label: "Vega", value: 63, sub: "fast", color: seriesColor(3) },
  { label: "Lumen", value: 49, sub: "compact" },
]

export default function RankBarsDemo() {
  return (
    <div style={{ maxWidth: 520, padding: 16 }}>
      <RankBarChart items={items} maxValue={100} unit="" />
    </div>
  )
}
