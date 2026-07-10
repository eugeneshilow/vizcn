import { Waffle } from './waffle-grid'

export default function WaffleGridDemo() {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <p className="mb-4 text-[13px] font-semibold text-[var(--vz-ink,#111)]">
        Agentic benchmark · tasks solved, Jun 2026
      </p>
      <Waffle value={68} caption="tasks Atlas 4 completes end-to-end without human help" />
    </div>
  )
}
