import { seriesColor } from "../../lib/palette"
import { DistributionBar, type DistributionSegment } from "./distribution-bar"

/**
 * Deterministic, brand-neutral demo: how a fixed compute budget splits across
 * generic workload domains. Colors come from the categorical palette.
 */
const segments: DistributionSegment[] = [
  { label: "Reasoning", value: 42, color: seriesColor(0) },
  { label: "Coding", value: 28, color: seriesColor(1) },
  { label: "Math", value: 16, color: seriesColor(2) },
  { label: "Vision", value: 9, color: seriesColor(3) },
  { label: "Agentic", value: 5, color: seriesColor(4) },
]

export default function DistributionBarDemo() {
  return (
    <div className="mx-auto max-w-[560px] p-4">
      <DistributionBar segments={segments} unit="runs" />
    </div>
  )
}
