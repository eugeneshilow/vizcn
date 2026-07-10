/**
 * PipelineFlow — schematic of a linear process: how one item/ticket travels
 * through an ordered set of steps. Each step is a labeled box; between boxes a
 * marching-ants arrow shows flow direction. The flow animation is pure CSS and
 * honors `prefers-reduced-motion` (stops marching when reduce is requested).
 *
 * Answers: "what are the stages, in order, and where does work move next?"
 *
 * Props:
 *   steps: Array<{ name: string; desc: string }>  — ordered stages, one box each.
 *
 * Pure props→SVG/DOM; no hooks, safe as a server component.
 */

import { seriesColor } from '../../lib/palette'

const FLOW = seriesColor(0)

export function PipelineFlow({ steps }: { steps: Array<{ name: string; desc: string }> }) {
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
                  stroke={FLOW}
                  strokeWidth="2.5"
                  strokeDasharray="7 7"
                  className="vp-flow"
                  style={{ animation: 'vp-march 0.7s linear infinite' }}
                />
                <path d="M34 3 L42 8 L34 13 Z" fill={FLOW} />
              </svg>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
