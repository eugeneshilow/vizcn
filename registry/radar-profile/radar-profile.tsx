/**
 * RadarProfile — head-to-head radar (spider) chart for exactly two entities.
 *
 * Answers "where does A beat B, and where does it lose?" in 2 seconds:
 * one polygon per entity over a shared set of 0-100 axes, the primary
 * entity (a) drawn on top with a heavier stroke, plus a two-row legend.
 * Pure server component — props in, inline SVG out, zero client JS.
 *
 * Props:
 * - axes: string[] — axis labels, drawn clockwise from 12 o'clock.
 * - a: { label, values, color? } — primary entity; values are 0-100,
 *   one per axis, in axes order. color defaults to seriesColor(0).
 * - b: { label, values, color? } — comparison entity; color defaults
 *   to seriesColor(1).
 */
import { seriesColor } from '../../lib/palette'

const INK = 'var(--vz-ink,#111)'
const HAIR = 'var(--vz-track,#F0EFED)'

export type RadarEntity = {
  label: string
  /** one value per axis, 0-100 scale */
  values: number[]
  /** series color (default: seriesColor(0) for a, seriesColor(1) for b) */
  color?: string
}

/**
 * Two-entity radar profile: filled polygons over shared 0-100 axes,
 * grid rings at 33 / 66 / 100, legend beside the chart.
 */
export function RadarProfile({ axes, a, b }: { axes: string[]; a: RadarEntity; b: RadarEntity }) {
  const colorA = a.color ?? seriesColor(0)
  const colorB = b.color ?? seriesColor(1)
  const C = 150
  const R = 105
  const pt = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2
    return `${(C + Math.cos(angle) * R * (v / 100)).toFixed(1)},${(C + Math.sin(angle) * R * (v / 100)).toFixed(1)}`
  }
  const ring = (frac: number) => axes.map((_, i) => pt(i, frac * 100)).join(' ')
  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg viewBox="0 0 300 300" className="w-full max-w-[320px]">
        {[0.33, 0.66, 1].map((f) => (
          <polygon key={f} points={ring(f)} fill="none" stroke={HAIR} strokeWidth="1" />
        ))}
        {axes.map((axis, i) => {
          const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2
          return (
            <text
              key={axis}
              x={C + Math.cos(angle) * (R + 22)}
              y={C + Math.sin(angle) * (R + 22) + 4}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="600"
              fill={INK}
            >
              {axis}
            </text>
          )
        })}
        <polygon
          points={b.values.map((v, i) => pt(i, v)).join(' ')}
          fill={colorB}
          fillOpacity="0.14"
          stroke={colorB}
          strokeWidth="2"
          pathLength={1}
          className="vc-draw"
        />
        <polygon
          points={a.values.map((v, i) => pt(i, v)).join(' ')}
          fill={colorA}
          fillOpacity="0.2"
          stroke={colorA}
          strokeWidth="2.5"
          pathLength={1}
          className="vc-draw"
        />
      </svg>
      <div className="space-y-2 text-[13px]">
        <p className="flex items-center gap-2">
          <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: colorA }} />{' '}
          <b>{a.label}</b>
        </p>
        <p className="flex items-center gap-2">
          <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: colorB }} />{' '}
          <span className="text-[var(--vz-text3,#5C5C5C)]">{b.label}</span>
        </p>
      </div>
    </div>
  )
}
