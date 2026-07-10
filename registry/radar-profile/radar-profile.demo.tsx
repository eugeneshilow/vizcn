import { RadarProfile } from './radar-profile'

const AXES = ['Reasoning', 'Coding', 'Math', 'Vision', 'Agentic', 'Speed']

export default function RadarProfileDemo() {
  return (
    <RadarProfile
      axes={AXES}
      a={{ label: 'Atlas', values: [92, 88, 84, 71, 90, 62] }}
      b={{ label: 'Nova', values: [85, 91, 78, 83, 74, 88] }}
    />
  )
}
