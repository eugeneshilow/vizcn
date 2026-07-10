import { TugOfWar } from "./tug-of-war"
import { seriesColor } from "../../lib/palette"

/**
 * Deterministic, brand-neutral demo: two invented models duel across five
 * generic domains. Colors come from the categorical palette (no vendor hues).
 */
export default function TugOfWarDemo() {
  return (
    <TugOfWar
      left={{ label: "Atlas", color: seriesColor(0) }}
      right={{ label: "Nova", color: seriesColor(1) }}
      rows={[
        { bench: "Reasoning", leftValue: 58, rightValue: 42, date: "Q1" },
        { bench: "Coding", leftValue: 47, rightValue: 53, date: "Q1" },
        { bench: "Math", leftValue: 64, rightValue: 36, date: "Q2" },
        { bench: "Vision", leftValue: 39, rightValue: 61, date: "Q2" },
        { bench: "Agentic", leftValue: 51, rightValue: 49, date: "Q3" },
      ]}
    />
  )
}
