import { Waffle } from './waffle-grid'
import { seriesColor } from '../../lib/palette'

/**
 * Deterministic, brand-neutral demo of the Waffle grid.
 * Three fixed percentages, each in a distinct categorical hue.
 */
export default function WaffleGridDemo() {
  return (
    <div className="flex flex-wrap gap-12">
      <Waffle value={72} color={seriesColor(0)} caption="задач Atlas закрывает с первой попытки" />
      <Waffle value={41} color={seriesColor(2)} caption="прогонов Nova проходят без правок" />
      <Waffle value={9} color={seriesColor(5)} caption="случаев требуют ручного вмешательства" />
    </div>
  )
}
