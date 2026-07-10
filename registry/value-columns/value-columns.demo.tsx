import { ColumnChart } from './value-columns'
import { seriesColor } from '../../lib/palette'

export default function ValueColumnsDemo() {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <p className="mb-4 text-[13px] font-semibold text-[var(--vz-ink,#111)]">
        Pro plan price · $/month, Jun 2026
      </p>
      {/* color follows the entity: each vendor's column wears its color */}
      <ColumnChart
        items={[
          { label: 'Atlas 4', sub: 'Meridian', value: 20, valueLabel: '$20', highlight: true },
          { label: 'Nova Max', sub: 'Helix Labs', value: 30, valueLabel: '$30', color: seriesColor(1) },
          { label: 'Orion Pro', sub: 'Vantage', value: 25, valueLabel: '$25', color: seriesColor(2) },
          { label: 'Vega 2', sub: 'Stellar', value: 15, valueLabel: '$15', color: seriesColor(3) },
          { label: 'Lumen', sub: 'Helix Labs', value: 10, valueLabel: '$10', color: seriesColor(4) },
        ]}
      />
    </div>
  )
}
