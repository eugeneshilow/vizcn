import { HeatStrip } from './heat-strip'

// 52 weekly counts, oldest first — a project ramping up over the year
// with a mid-year lull and a strong recent stretch. Deterministic.
const WEEKS = [
  12, 18, 9, 22, 31, 27, 14, 8, 19, 25, 33, 41, 38, 29, 17, 11, 6, 3, 8, 15, 24, 36, 44, 52, 47,
  39, 31, 26, 34, 42, 55, 61, 58, 49, 37, 28, 21, 16, 23, 35, 46, 57, 63, 71, 68, 54, 43, 39, 48,
  59, 66, 62,
]

export default function HeatStripDemo() {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <p className="mb-4 text-[13px] font-semibold text-[var(--vz-ink,#111)]">
        Atlas SDK · a year of weekly activity
      </p>
      <HeatStrip weeks={WEEKS} />
    </div>
  )
}
