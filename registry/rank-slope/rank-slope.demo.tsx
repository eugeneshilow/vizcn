import { RankSlope } from './rank-slope'

export default function RankSlopeDemo() {
  return (
    <RankSlope
      left="SWE-Bench Pro"
      right="DeepSWE"
      unit="%"
      items={[
        { label: 'claude-opus-4.7', from: 64, to: 54, color: '#A8562F' },
        { label: 'gpt-5.5', from: 59, to: 70, color: '#0F766E' },
        { label: 'gpt-5.4', from: 58, to: 56, color: '#0F766E' },
        { label: 'claude-sonnet-4.6', from: 54, to: 32, color: '#A8562F' },
        { label: 'gpt-5.4-mini', from: 54, to: 24, color: '#0F766E' },
        { label: 'gemini-3.1-pro', from: 46, to: 10, color: '#2563EB' },
        { label: 'claude-haiku-4.5', from: 39, to: 0, color: '#A8562F' },
        { label: 'gemini-3-flash', from: 35, to: 5, color: '#2563EB' },
      ]}
    />
  )
}
