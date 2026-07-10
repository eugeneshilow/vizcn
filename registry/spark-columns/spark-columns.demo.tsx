import { SparkColumns } from "./spark-columns"

/**
 * Deterministic demo: three trend sparklines with neutral labels.
 */
export default function SparkColumnsDemo() {
  const rows = [
    { label: "Reasoning", values: [42, 45, 44, 51, 58, 62, 60, 71] },
    { label: "Coding", values: [80, 74, 69, 66, 61, 55, 52, 48] },
    { label: "Vision", values: [30, 33, 31, 38, 36, 41, 47, 52] },
  ]
  return (
    <div className="flex flex-col gap-6">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-[var(--vz-text2,#3D3D3D)]">
            {row.label}
          </span>
          <SparkColumns values={row.values} />
        </div>
      ))}
    </div>
  )
}
