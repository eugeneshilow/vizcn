import { RadarProfile } from "./radar-profile"
import { seriesColor } from "../../lib/palette"

/**
 * Deterministic, brand-neutral demo: two models (Atlas vs Nova) profiled across
 * five generic capability domains on a shared 0–100 scale. Series colors come
 * from the categorical palette; no random data.
 */
export default function RadarProfileDemo() {
  const axes = ["Reasoning", "Coding", "Math", "Vision", "Agentic"]
  return (
    <RadarProfile
      axes={axes}
      a={{ label: "Atlas", color: seriesColor(0), values: [88, 72, 80, 64, 76] }}
      b={{ label: "Nova", color: seriesColor(1), values: [70, 90, 66, 82, 58] }}
    />
  )
}
