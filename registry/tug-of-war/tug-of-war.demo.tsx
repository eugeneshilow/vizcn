import { TugOfWar } from './tug-of-war'

export default function TugOfWarDemo() {
  return (
    <TugOfWar
      left={{ label: 'Atlas' }}
      right={{ label: 'Nova' }}
      rows={[
        { bench: 'Reasoning', leftValue: 62, rightValue: 38, date: 'May 2026' },
        { bench: 'Coding', leftValue: 71, rightValue: 29, date: 'May 2026' },
        { bench: 'Math', leftValue: 44, rightValue: 56, date: 'Apr 2026' },
        { bench: 'Vision', leftValue: 35, rightValue: 65, date: 'Apr 2026' },
        { bench: 'Agentic', leftValue: 58, rightValue: 42, date: 'Jun 2026' },
      ]}
    />
  )
}
