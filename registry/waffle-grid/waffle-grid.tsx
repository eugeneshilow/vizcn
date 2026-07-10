/**
 * Waffle — "N of 100" as a crowd: a 10x10 grid of cells where the first
 * N cells are filled with the accent color and the rest stay on the
 * neutral track.
 *
 * Answers "how big is this share, really?" in 2 seconds: a percentage
 * rendered as countable units reads more viscerally than a number or a
 * pie slice. Pure server component — div-based, zero client JS.
 *
 * Props:
 * - value: number — how many cells out of 100 are filled (0–100).
 * - color?: string — fill color for the counted cells
 *   (default: seriesColor(0)).
 * - caption: string — one-line explanation shown next to the bold
 *   "N of 100" readout.
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
            title={`${value} of 100`}
            style={{ backgroundColor: i < value ? color : 'var(--vz-track,#F5F5F4)' }}
          />
        ))}
      </div>
      <p className="mt-3 max-w-[460px] text-[13.5px] leading-6 text-[var(--vz-text3,#5C5C5C)]">
        <b className="text-[16px]" style={{ color }}>
          {value} of 100
        </b>{' '}
        - {caption}
      </p>
    </div>
  )
}
