import { seriesColor } from '../../lib/palette'

/**
 * PipelineFlow — "what are the stages, and which way does work move?"
 *
 * A horizontal chain of labeled stage boxes connected by animated
 * marching-ants arrows (CSS-only, so it renders from a server component
 * and respects prefers-reduced-motion). Wraps to new rows on narrow
 * containers.
 *
 * Props:
 * - steps:  Array<{ name: string; desc: string }> — ordered pipeline
 *           stages; `name` is the bold title, `desc` a one-line caption.
 * - accent: string — arrow/connector color (default: seriesColor(0)).
 */
export function PipelineFlow({
  steps,
  accent = seriesColor(0),
}: {
  steps: Array<{ name: string; desc: string }>
  accent?: string
}) {
  return (
    <div className="max-w-[760px]">
      <style>{`@keyframes vp-march{to{stroke-dashoffset:-14px}}
@media (prefers-reduced-motion: reduce){.vp-flow{animation:none!important}}`}</style>
      <div className="flex flex-wrap items-stretch gap-y-4">
        {steps.map((step, i) => (
          <div key={step.name} className="flex items-center">
            <div className="vc-reveal w-[132px] border-2 border-[var(--vz-ink,#111)] px-3 py-2.5">
              <p className="text-[12px] font-bold leading-4">{step.name}</p>
              <p className="mt-1 text-[10.5px] leading-4 text-[var(--vz-muted,#8A8A8A)]">
                {step.desc}
              </p>
            </div>
            {i < steps.length - 1 ? (
              <svg width="44" height="16" className="shrink-0">
                <line
                  x1="2"
                  y1="8"
                  x2="36"
                  y2="8"
                  stroke={accent}
                  strokeWidth="2.5"
                  strokeDasharray="7 7"
                  className="vp-flow"
                  style={{ animation: 'vp-march 0.7s linear infinite' }}
                />
                <path d="M34 3 L42 8 L34 13 Z" fill={accent} />
              </svg>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
