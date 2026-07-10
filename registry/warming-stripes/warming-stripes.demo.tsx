import { WarmingStripes } from './warming-stripes'

export default function WarmingStripesDemo() {
  return (
    <WarmingStripes
      from={1950}
      to={2025}
      eras={[
        { start: 1950, end: 1965, heat: 2, label: 'First boom' },
        { start: 1966, end: 1979, heat: 0, label: 'First winter' },
        { start: 1980, end: 1986, heat: 2, label: 'Revival' },
        { start: 1987, end: 1999, heat: 0, label: 'Second winter' },
        { start: 2000, end: 2011, heat: 1 },
        { start: 2012, end: 2021, heat: 2 },
        { start: 2022, end: 2025, heat: 3, label: 'Breakout' },
      ]}
      note="Research funding climate by year: each stripe is one year; darker means hotter. Uncovered years default to neutral."
    />
  )
}
