'use client'

import { useState } from 'react'
import { seriesColor } from '../../lib/palette'

/**
 * VerdictStack — interactive 100%-normalized outcome composition by subject.
 *
 * Answers "what do each subject's outcomes consist of?" in 2 seconds: every
 * subject is one full-width taxonomy stack, so the relative makeup is easy to
 * compare. The legend preserves taxonomy groups and doubles as a filter:
 * clicking a tag highlights that segment across every row and dims the rest;
 * clicking it again resets. Client state is local and data stays in props.
 *
 * Props:
 * - subjects: {label, n, counts: Record<string,number>}[].
 * - taxonomy: {group, tags: {key,label,color?}[]}[] in stack order.
 * - omitted tag colors use seriesColor(index) across the flattened taxonomy.
 */

const MONO = 'ui-monospace, SFMono-Regular, monospace'

export type VerdictSubject = {
  label: string
  n: number
  counts: Record<string, number>
}

export type VerdictTaxonomyGroup = {
  group: string
  tags: {
    key: string
    label: string
    color?: string
  }[]
}

export function VerdictStack({
  subjects,
  taxonomy,
}: {
  subjects: VerdictSubject[]
  taxonomy: VerdictTaxonomyGroup[]
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const tags = taxonomy.flatMap((group) => group.tags)
  const colors = new Map(tags.map((tag, index) => [tag.key, tag.color ?? seriesColor(index)]))

  return (
    <div className="overflow-x-auto border-y border-[var(--vz-ink,#111111)] py-5 text-[var(--vz-ink,#111111)] [font-variant-numeric:tabular-nums]">
      <div className="min-w-[620px]">
        <div className="space-y-3" role="group" aria-label="Outcome composition by subject">
          {subjects.map((subject, subjectIndex) => {
            const total = tags.reduce((sum, tag) => sum + Math.max(subject.counts[tag.key] ?? 0, 0), 0)
            return (
              <div
                key={`${subject.label}-${subjectIndex}`}
                className="grid grid-cols-[150px_minmax(320px,1fr)_52px] items-center gap-x-3"
              >
                <p className="truncate text-[11.5px] font-semibold">{subject.label}</p>
                <div
                  className="flex h-[22px] overflow-hidden border border-[var(--vz-ink,#111111)]"
                  role="img"
                  aria-label={`${subject.label}: ${tags
                    .map((tag) => `${tag.label} ${Math.max(subject.counts[tag.key] ?? 0, 0)}`)
                    .join(', ')}`}
                >
                  {tags.map((tag) => {
                    const count = Math.max(subject.counts[tag.key] ?? 0, 0)
                    const percent = total > 0 ? (count / total) * 100 : 0
                    const dimmed = selectedKey !== null && selectedKey !== tag.key
                    return (
                      <div
                        key={tag.key}
                        className="h-full transition-opacity"
                        style={{
                          width: `${percent}%`,
                          minWidth: count > 0 ? '1px' : undefined,
                          backgroundColor: colors.get(tag.key),
                          opacity: dimmed ? 0.25 : 1,
                        }}
                        title={`${tag.label} · ${count} · ${Math.round(percent)}%`}
                      />
                    )
                  })}
                </div>
                <p
                  className="text-right text-[9.5px] text-[var(--vz-muted,#8a8a8a)]"
                  style={{ fontFamily: MONO }}
                >
                  n={subject.n}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-5 border-t border-[var(--vz-grid,#e3e3e3)] pt-4">
          {taxonomy.map((group) => (
            <div
              key={group.group}
              className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3 border-b border-[var(--vz-grid,#e3e3e3)] py-2 last:border-b-0"
            >
              <p
                className="pt-[5px] text-[9px] uppercase tracking-[0.1em] text-[var(--vz-muted,#8a8a8a)]"
                style={{ fontFamily: MONO }}
              >
                {group.group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.tags.map((tag) => {
                  const active = selectedKey === tag.key
                  const dimmed = selectedKey !== null && !active
                  return (
                    <button
                      key={tag.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedKey(active ? null : tag.key)}
                      className="flex items-center gap-1.5 border border-[var(--vz-grid,#e3e3e3)] px-2 py-1 text-[9.5px] text-[var(--vz-text3,#5c5c5c)] transition-[border-color,opacity] hover:border-[var(--vz-ink,#111111)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vz-ink,#111111)]"
                      style={{ fontFamily: MONO, opacity: dimmed ? 0.45 : 1 }}
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2"
                        style={{ backgroundColor: colors.get(tag.key) }}
                      />
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
