import { seriesColor } from '../../lib/palette'

/**
 * ShareStrip — one compact 100% strip for flat part-to-whole composition.
 *
 * Answers "what makes up the whole, in one strip?" in 2 seconds: a single
 * hard-bordered band carries every proportion. Segments at least 9% wide get
 * an internal label and value; the complete legend below preserves every
 * category, raw value, and rounded percent. Div-only, token-driven rendering
 * with serializable props and no client runtime.
 *
 * Props:
 * - parts: {label, value, color?}[]; colors default to seriesColor(index).
 * - title?: small uppercase heading above the strip.
 * - unit?: suffix appended to values in the strip and legend.
 */

const MONO = 'ui-monospace, SFMono-Regular, monospace'

export type ShareStripPart = {
  label: string
  value: number
  color?: string
}

export function ShareStrip({
  parts,
  title,
  unit = '',
}: {
  parts: ShareStripPart[]
  title?: string
  unit?: string
}) {
  const positiveParts = parts.map((part) => ({ ...part, value: Math.max(part.value, 0) }))
  const total = positiveParts.reduce((sum, part) => sum + part.value, 0)
  if (total <= 0) return null

  return (
    <div className="text-[var(--vz-ink,#111111)] [font-variant-numeric:tabular-nums]">
      {title ? (
        <p
          className="mb-2 text-[9px] uppercase tracking-[0.1em] text-[var(--vz-muted,#8a8a8a)]"
          style={{ fontFamily: MONO }}
        >
          {title}
        </p>
      ) : null}
      <div
        className="flex h-7 overflow-hidden border border-[var(--vz-ink,#111111)]"
        role="img"
        aria-label={positiveParts.map((part) => `${part.label} ${part.value}${unit}`).join(', ')}
      >
        {positiveParts.map((part, index) => {
          const percent = (part.value / total) * 100
          const color = part.color ?? seriesColor(index)
          return (
            <div
              key={`${part.label}-${index}`}
              className="flex min-w-0 items-center justify-center overflow-hidden px-1 text-[9px] font-semibold text-[var(--vz-surface,#ffffff)]"
              style={{ width: `${percent}%`, backgroundColor: color, fontFamily: MONO }}
              title={`${part.label} · ${part.value}${unit} · ${Math.round(percent)}%`}
            >
              {percent >= 9 ? (
                <span className="truncate">
                  {part.label} {part.value}
                  {unit}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {positiveParts.map((part, index) => {
          const percent = Math.round((part.value / total) * 100)
          const color = part.color ?? seriesColor(index)
          return (
            <div
              key={`${part.label}-${index}`}
              className="flex items-baseline gap-1.5 text-[10px]"
              style={{ fontFamily: MONO }}
            >
              <span aria-hidden className="h-2 w-2 self-center" style={{ backgroundColor: color }} />
              <span className="font-semibold">{part.label}</span>
              <span>
                {part.value}
                {unit}
              </span>
              <span className="text-[var(--vz-muted,#8a8a8a)]">{percent}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
