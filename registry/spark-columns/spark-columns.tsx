import { seriesColor } from "../../lib/palette"

/**
 * SparkColumns — micro sparkline of ~8 recent values as columns.
 *
 * Answers: "which way is this metric trending, at a glance?" The trailing
 * columns are a neutral track color; the final (most recent) column is drawn
 * in an accent so the latest reading pops. Pure props → SVG-free inline divs,
 * no hooks (safe as a server component).
 *
 * Props:
 * - values: number[]   — series of recent readings, oldest → newest (min 3).
 * - accent?: string    — color of the last column (default: series hue 0).
 * - height?: number    — pixel height of the tallest column (default 40).
 */
export function SparkColumns({
  values,
  accent = seriesColor(0),
  height = 40,
}: {
  values: number[]
  accent?: string
  height?: number
}) {
  if (values.length < 3) return null
  const peak = Math.max(...values, 1)
  return (
    <div className="mx-auto flex w-full max-w-[220px] items-end gap-[3px]" style={{ height }}>
      {values.map((value, index) => (
        <div
          key={index}
          className="vc-grow-y min-w-0 flex-1"
          title={`−${values.length - 1 - index}: ${value.toLocaleString("en-US")}`}
          style={{
            height: Math.max(3, (value / peak) * height),
            backgroundColor: index === values.length - 1 ? accent : "var(--vz-track,#E4E1DC)",
            borderRadius: "2px 2px 0 0",
          }}
        />
      ))}
    </div>
  )
}
