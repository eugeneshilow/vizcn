import { PairedBars } from './paired-bars'

export default function PairedBarsDemo() {
  return (
    <PairedBars
      barLabel="pass rate"
      unit="%"
      max={60}
      ticks={[0, 20, 40, 60]}
      groups={[
        {
          label: 'claude-opus-4.7',
          color: '#A8562F',
          a: { label: 'mini-swe-agent', value: 50 },
          b: { label: 'Claude Code', value: 40 },
        },
        {
          label: 'gpt-5.5',
          color: '#0F766E',
          a: { label: 'mini-swe-agent', value: 40 },
          b: { label: 'Codex CLI', value: 40 },
        },
        {
          label: 'gemini-3.1-pro',
          color: '#2563EB',
          a: { label: 'mini-swe-agent', value: 40 },
          b: { label: 'Gemini CLI', value: 20 },
        },
      ]}
    />
  )
}
