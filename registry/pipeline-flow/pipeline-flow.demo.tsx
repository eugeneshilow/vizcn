import { PipelineFlow } from './pipeline-flow'

const STEPS = [
  { name: 'Intake', desc: 'ticket lands in the queue' },
  { name: 'Triage', desc: 'sorted and prioritized' },
  { name: 'Build', desc: 'change is implemented' },
  { name: 'Review', desc: 'checked by a second pair' },
  { name: 'Ship', desc: 'merged and released' },
]

export default function PipelineFlowDemo() {
  return <PipelineFlow steps={STEPS} />
}
