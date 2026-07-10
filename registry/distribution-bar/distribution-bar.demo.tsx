import { DistributionBar } from './distribution-bar'

/** Task mix of a fictional benchmark suite, split by domain. */
export default function DistributionBarDemo() {
  return (
    <div className="w-full max-w-[720px]">
      <DistributionBar
        unit="tasks"
        segments={[
          { label: 'Reasoning', value: 412 },
          { label: 'Coding', value: 318 },
          { label: 'Math', value: 205 },
          { label: 'Vision', value: 96 },
          { label: 'Agentic', value: 54 },
        ]}
      />
    </div>
  )
}
