import { DumbbellRange } from './dumbbell-range'

export default function DumbbellRangeDemo() {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <p className="mb-4 text-[13px] font-semibold text-[var(--vz-ink,#111)]">
        API pricing · input / output, Jun 2026
      </p>
      <DumbbellRange
        loLabel="input"
        hiLabel="output"
        caption="$ per 1M tokens"
        rows={[
          { label: 'Atlas 4', lo: 15, hi: 75, highlight: true },
          { label: 'Nova Max', lo: 10, hi: 40 },
          { label: 'Orion Pro', lo: 5, hi: 25 },
          { label: 'Vega 2', lo: 2.5, hi: 10 },
          { label: 'Lumen', lo: 0.5, hi: 4 },
        ]}
      />
    </div>
  )
}
