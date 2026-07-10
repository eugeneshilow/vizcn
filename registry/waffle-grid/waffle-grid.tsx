/**
 * Waffle — a 10×10 grid of 100 cells where the first `value` cells are filled.
 *
 * Answers: "what does N-out-of-100 feel like?" — a percentage rendered as a
 * crowd instead of a bare number. Pure props → SVG-free markup (spans), no
 * hooks, so it stays a React Server Component.
 *
 * Props:
 *   value   number  — how many of the 100 cells are filled (0–100)
 *   color?  string  — fill color for the active cells (default: seriesColor(0))
 *   caption string  — short label placed after the "N из 100" figure
 */
import { seriesColor } from '../../lib/palette'

export function Waffle({
  value,
  color = seriesColor(0),
  caption,
}: {
  value: number
  color?: string
  caption: string
}) {
  return (
    <div>
      <div className="vc-reveal grid w-fit grid-cols-10 gap-[5px]">
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className="block h-[18px] w-[18px] rounded-[4px]"
            title={`${value} из 100`}
            style={{ backgroundColor: i < value ? color : 'var(--vz-track,#EFEDEA)' }}
          />
        ))}
      </div>
      <p className="mt-3 max-w-[460px] text-[13.5px] leading-6 text-[var(--vz-text3,#5C5C5C)]">
        <b className="text-[16px]" style={{ color }}>
          {value} из 100
        </b>{' '}
        - {caption}
      </p>
    </div>
  )
}
