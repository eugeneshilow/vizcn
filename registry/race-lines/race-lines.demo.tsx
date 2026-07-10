import { ActivityLineChart, type ActivitySeries } from './race-lines'
import { seriesColor } from '../../lib/palette'

/**
 * race-lines demo — four generic model series racing on weekly request
 * volume across three weeks. Deterministic data (no Math.random / Date.now).
 * One series carries a null to show gap-bridging.
 */

const days = [
  '2024-05-01',
  '2024-05-04',
  '2024-05-07',
  '2024-05-10',
  '2024-05-13',
  '2024-05-16',
  '2024-05-19',
  '2024-05-22',
  '2024-05-25',
  '2024-05-28',
  '2024-05-31',
  '2024-06-03',
]

const series: ActivitySeries[] = [
  {
    label: 'Atlas',
    color: seriesColor(0),
    highlight: true,
    legendValue: '9.4M/wk',
    values: [3_100_000, 3_600_000, 4_200_000, 5_100_000, 5_800_000, 6_500_000, 7_200_000, 7_900_000, 8_400_000, 8_900_000, 9_200_000, 9_400_000],
  },
  {
    label: 'Nova',
    color: seriesColor(1),
    legendValue: '6.1M/wk',
    values: [4_800_000, 4_600_000, 4_500_000, 4_300_000, 4_100_000, 4_400_000, 4_900_000, 5_300_000, 5_600_000, 5_900_000, 6_000_000, 6_100_000],
  },
  {
    label: 'Orion',
    color: seriesColor(2),
    legendValue: '4.7M/wk',
    values: [2_200_000, 2_500_000, 2_900_000, 3_200_000, null, 3_800_000, 4_000_000, 4_200_000, 4_300_000, 4_500_000, 4_600_000, 4_700_000],
  },
  {
    label: 'Vega',
    color: seriesColor(3),
    legendValue: '2.3M/wk',
    values: [900_000, 1_050_000, 1_200_000, 1_350_000, 1_500_000, 1_650_000, 1_800_000, 1_950_000, 2_050_000, 2_150_000, 2_250_000, 2_300_000],
  },
]

export default function RaceLinesDemo() {
  return (
    <div style={{ maxWidth: 960 }}>
      <ActivityLineChart days={days} series={series} yLabel="Requests per week" />
    </div>
  )
}
