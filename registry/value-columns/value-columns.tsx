'use client'

/**
 * ColumnChart — plain vertical columns comparing magnitudes.
 *
 * Answers "how do these few values stack up side by side?" — the
 * tariffs/prices genre: value on top, zero-based column, label (and an
 * optional muted sub line) below. Columns scale from zero to the max value
 * of the list (or an explicit maxValue); the hero column gets the accent
 * color and a bold value. Client component only for the viewport-entry
 * animation (IntersectionObserver); rendering itself is plain divs.
 *
 * Props:
 * - items: RankBarItem[] — label, value, optional valueLabel / sub /
 *   highlight / per-column color.
 * - height?: number — column area height in px (default 180; labels add
 *   their own space below).
 * - maxValue?: number — scale ceiling (default: max item value).
 * - highlightColor?: string — column color for highlighted items
 *   (default: seriesColor(0)).
 */
import { useEffect, useRef, useState } from 'react'
import { seriesColor } from '../../lib/palette'

const COLUMN_DEFAULT = 'var(--vz-ink,#111)'

export type RankBarItem = {
  label: string
  value: number
  /** value caption (default: the number itself) */
  valueLabel?: string
  /** muted line under the label: vendor, date, note */
  sub?: string
  /** hero column — accent color + bold value */
  highlight?: boolean
  /** custom series color (per-vendor); highlight wins */
  color?: string
}

/**
 * Vertical columns (a variation on horizontal ranking bars): tariffs,
 * counters. Scale runs from zero to the max value of the list (or maxValue).
 */
export function ColumnChart({
  items,
  height = 180,
  maxValue,
  highlightColor = seriesColor(0),
}: {
  items: RankBarItem[]
  height?: number
  maxValue?: number
  highlightColor?: string
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

  const max = maxValue ?? Math.max(...items.map((item) => item.value), 1)
  return (
    <div
      ref={wrapRef}
      className={`flex items-end gap-6 ${entered ? 'vlc-in' : ''}`}
      style={{ height: height + 56 }}
    >
      {items.map((item, index) => {
        const h = Math.max(8, Math.round((item.value / max) * height))
        const color = item.highlight ? highlightColor : (item.color ?? COLUMN_DEFAULT)
        return (
          <div
            key={item.label}
            className="flex min-w-0 flex-1 flex-col items-center justify-end"
            style={{ '--i': index } as React.CSSProperties}
          >
            <p
              className={`vlc-val mb-1.5 text-[13px] tabular-nums text-[var(--vz-ink,#111)] ${item.highlight ? 'font-bold' : 'font-semibold'}`}
            >
              {item.valueLabel ?? item.value}
            </p>
            <div
              className="vlc-col w-full max-w-[88px]"
              title={`${item.label} · ${item.valueLabel ?? item.value}`}
              style={{ height: h, backgroundColor: color, borderRadius: '4px 4px 0 0' }}
            />
            <p className="mt-2 w-full truncate text-center text-[11.5px] font-medium text-[var(--vz-text3,#5C5C5C)]">
              {item.label}
            </p>
            {item.sub ? (
              <p className="w-full truncate text-center text-[10px] leading-4 text-[var(--vz-muted,#8A8A8A)]">
                {item.sub}
              </p>
            ) : null}
          </div>
        )
      })}

      {/* Columns grow from the baseline on viewport entry, values fade in after; off under prefers-reduced-motion */}
      <style>{`
        .vlc-in .vlc-col {
          transform-origin: bottom;
          animation: vlc-grow 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) both;
          animation-delay: calc(var(--i) * 35ms);
        }
        .vlc-in .vlc-val {
          animation: vlc-fade 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) both;
          animation-delay: calc(var(--i) * 35ms + 200ms);
        }
        @keyframes vlc-grow { from { transform: scaleY(0); } }
        @keyframes vlc-fade { from { opacity: 0; transform: translateY(4px); } }
        @media (prefers-reduced-motion: reduce) {
          .vlc-in .vlc-col, .vlc-in .vlc-val { animation: none; }
        }
      `}</style>
    </div>
  )
}
