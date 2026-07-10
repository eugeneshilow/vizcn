import { seriesColor } from '../../lib/palette'
import { Treemap } from './treemap'

const VENDOR = {
  meridian: seriesColor(0),
  helix: seriesColor(1),
  vantage: seriesColor(2),
}

export default function TreemapDemo() {
  return (
    <div className="mx-auto max-w-[640px]">
      <p className="mb-2 text-[13px] font-bold text-[var(--vz-ink,#111)]">Assistant usage share, Jun 2026</p>
      <Treemap
        rows={2}
        rowHeight={104}
        items={[
          {
            label: 'Atlas',
            value: 34,
            valueLabel: '34%',
            sub: 'Meridian',
            badge: 'npm 12.4M/wk',
            color: VENDOR.meridian,
          },
          {
            label: 'Nova',
            value: 26,
            valueLabel: '26%',
            sub: 'Helix Labs',
            badge: 'npm 8.1M/wk',
            color: VENDOR.helix,
          },
          {
            label: 'Orion',
            value: 18,
            valueLabel: '18%',
            sub: 'Vantage',
            badge: 'npm 4.9M/wk',
            color: VENDOR.vantage,
          },
          {
            label: 'Vega',
            value: 12,
            valueLabel: '12%',
            sub: 'Meridian',
            color: VENDOR.meridian,
          },
          {
            label: 'Lumen',
            value: 7,
            valueLabel: '7%',
            sub: 'Helix Labs',
            color: VENDOR.helix,
          },
          { label: 'Others', value: 3, valueLabel: '3%', sub: 'long tail', muted: true },
        ]}
      />
      <p className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--vz-muted,#8A8A8A)]">
        area = share of total · color = vendor · brighter = bigger
      </p>
    </div>
  )
}
