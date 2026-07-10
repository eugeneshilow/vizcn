/**
 * RadarProfile — a 5-axis (or N-axis) polygon radar comparing two overlaid
 * series (a vs b) on a shared 0–100 scale. Answers: "on which dimensions does
 * A lead or trail B?" Pure props → SVG (no hooks), so it renders as a server
 * component.
 *
 * Props:
 *   axes  — string[] axis labels, laid out clockwise from the top.
 *   a, b  — each { label, color, values: number[] }; `values[i]` is the 0–100
 *           reading on `axes[i]`. `a` renders on top (heavier stroke/fill).
 *           `color` is yours to supply — use seriesColor(i) for neutral hues.
 *
 * Structural colors (ink / grid rings) come from theme.css --vz-* vars.
 * Motion: rings/polygons draw in via the vc-draw class (motion.css).
 */

export function RadarProfile({
  axes,
  a,
  b,
}: {
  axes: string[]
  a: { label: string; color: string; values: number[] }
  b: { label: string; color: string; values: number[] }
}) {
  const INK = 'var(--vz-ink,#111)'
  const HAIR = 'var(--vz-track,#F0EFED)'
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
          fill={b.color}
          fillOpacity="0.14"
          stroke={b.color}
          strokeWidth="2"
          pathLength={1}
          className="vc-draw"
        />
        <polygon
          points={a.values.map((v, i) => pt(i, v)).join(' ')}
          fill={a.color}
          fillOpacity="0.2"
          stroke={a.color}
          strokeWidth="2.5"
          pathLength={1}
          className="vc-draw"
        />
      </svg>
      <div className="space-y-2 text-[13px]">
        <p className="flex items-center gap-2">
          <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: a.color }} />{' '}
          <b>{a.label}</b>
        </p>
        <p className="flex items-center gap-2">
          <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: b.color }} />{' '}
          <span className="text-[var(--vz-text3,#5C5C5C)]">{b.label}</span>
        </p>
      </div>
    </div>
  )
}
