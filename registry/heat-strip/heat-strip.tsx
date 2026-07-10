'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * HeatStrip — a year of weekly activity as one strip of thin bars.
 *
 * Answers "is this alive?" in half a second: one bar per week (oldest left,
 * newest right), bar height and opacity both scale with the count, so the
 * strip reads as a heat texture rather than a precise chart. A numbers row
 * above gives the three facts that matter (total / peak per week / current
 * week); hovering any bar shows its exact count and how many weeks ago it
 * was. Bars grow in on viewport entry (IntersectionObserver-triggered,
 * time-based, disabled under reduced motion).
 *
 * Props:
 * - weeks: number[] — weekly counts, oldest first, newest last (typically 52).
 * - color?: string — bar color (default var(--vz-good, #059669)).
 */

const fmt = (n: number) => n.toLocaleString('en-US')

/**
 * A year-strip of weekly activity: numbers row (total / peak / current),
 * then one thin bar per week with a per-week hover tooltip.
 */
export function HeatStrip({
  weeks,
  color = 'var(--vz-good,#059669)',
}: {
  weeks: number[]
  color?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const node = wrapRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setEntered(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const max = Math.max(...weeks, 1)
  const total = weeks.reduce((sum, n) => sum + n, 0)
  const last = weeks[weeks.length - 1] ?? 0
  return (
    <div ref={wrapRef} className={entered ? 'vhs-in' : ''}>
      <p className="vhs-head mb-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-[var(--vz-text3,#5C5C5C)] [font-variant-numeric:tabular-nums]">
        <span>
          total <strong className="font-semibold text-[var(--vz-ink,#111)]">{fmt(total)}</strong>
        </span>
        <span>
          peak <strong className="font-semibold text-[var(--vz-ink,#111)]">{fmt(max)}</strong>
          /wk
        </span>
        <span>
          this week <strong className="font-semibold text-[var(--vz-ink,#111)]">{fmt(last)}</strong>
        </span>
      </p>
      <div className="flex items-end gap-[2px]" style={{ height: 56 }}>
        {weeks.map((count, i) => (
          <div key={i} className="group relative flex h-full min-w-0 flex-1 items-end">
            <span
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap bg-[var(--vz-chip,#111)] px-2 py-1 font-mono text-[10.5px] text-[var(--vz-chip-ink,#fff)] group-hover:block"
              style={{ borderRadius: 2 }}
            >
              {fmt(count)} · {i === weeks.length - 1 ? 'now' : `−${weeks.length - 1 - i} wk`}
            </span>
            <div
              className="vhs-bar w-full transition-opacity duration-150 group-hover:!opacity-100"
              style={{
                '--i': i,
                height: Math.max(3, (count / max) * 56),
                backgroundColor: color,
                opacity: 0.25 + 0.75 * (count / max),
                borderRadius: '2px 2px 0 0',
              } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--vz-muted,#8A8A8A)]">
        <span>−{weeks.length - 1} wk</span>
        <span>now</span>
      </div>

      {/* Bars grow up on viewport entry; disabled under prefers-reduced-motion */}
      <style>{`
        .vhs-in .vhs-head { animation: vhs-fade 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
        .vhs-in .vhs-bar {
          transform-origin: bottom;
          animation: vhs-grow 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) both;
          animation-delay: calc(var(--i) * 8ms);
        }
        @keyframes vhs-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vhs-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) {
          .vhs-in .vhs-head, .vhs-in .vhs-bar { animation: none; }
        }
      `}</style>
    </div>
  )
}
