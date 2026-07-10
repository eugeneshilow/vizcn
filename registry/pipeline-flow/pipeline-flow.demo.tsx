import { PipelineFlow } from './pipeline-flow'

const steps = [
  { name: 'Ingest', desc: 'pull raw runs from the harness' },
  { name: 'Normalize', desc: 'map scores to a shared scale' },
  { name: 'Verify', desc: 'cross-check against source logs' },
  { name: 'Score', desc: 'aggregate per model and domain' },
  { name: 'Publish', desc: 'push the board live' },
]

export default function PipelineFlowDemo() {
  return <PipelineFlow steps={steps} />
}
