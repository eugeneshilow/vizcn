/**
 * Treemap — the whole field as area: flat slice-and-dice treemap in N rows.
 *
 * Answers "how is the whole split up, and who dominates?" — each item is a
 * tile whose area is proportional to its share of the total. Items are
 * sorted descending, packed greedily into `rows` bands of roughly equal
 * total value, and each tile's width is its share of that band. Tile
 * opacity scales with value relative to the leader, so bigger players read
 * brighter. Tiles can carry an icon, sub-caption, live badge, and can be
 * links. Pure server component — div-based, zero client JS.
 *
 * Props:
 * - items: TreemapItem[] — label, value, optional valueLabel / sub / href /
 *   iconUrl / badge / color / muted.
 * - rows?: number — number of horizontal bands (default 2).
 * - rowHeight?: number — band height in px (default 96).
 * - defaultColor?: string — tile color when the item has none
 *   (default seriesColor(0)).
 */
import { seriesColor } from '../../lib/palette'

export type TreemapItem = {
  label: string
  value: number
  /** value caption (default: the number itself) */
  valueLabel?: string
  /** muted caption under the label: vendor, category, note */
  sub?: string
  /** makes the tile a link */
  href?: string
  /** small square icon rendered before the label */
  iconUrl?: string | null
  /** live source badge (e.g. "npm 10.3M/wk") — honest data only */
  badge?: string
  /** series color (follows the entity); default — defaultColor prop */
  color?: string
  /** de-emphasized tile: track background, muted text */
  muted?: boolean
}

/**
 * Flat slice-and-dice treemap: items sorted by value, packed into `rows`
 * bands; tile width = share of its band, area ≈ share of the total.
 */
export function Treemap({
  items,
  rows = 2,
  rowHeight = 96,
  defaultColor = seriesColor(0),
}: {
  items: TreemapItem[]
  rows?: number
  rowHeight?: number
  defaultColor?: string
}) {
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const total = sorted.reduce((a, i) => a + i.value, 0)
  const perRow = total / rows
  const rowsArr: Array<typeof sorted> = Array.from({ length: rows }, () => [])
  let acc = 0
  for (const item of sorted) {
    const rowIndex = Math.min(Math.floor(acc / perRow), rows - 1)
    rowsArr[rowIndex].push(item)
    acc += item.value
  }
  const renderRow = (row: typeof sorted, rowIndex: number) => {
    const rowTotal = Math.max(
      row.reduce((a, i) => a + i.value, 0),
      1
    )
    return (
      <div key={rowIndex} className="flex gap-[3px]" style={{ height: rowHeight }}>
        {row.map((item) => {
          const inner = (
            <>
              <div className="flex min-w-0 items-center gap-1.5">
                {item.iconUrl ? (
                  <img
                    src={item.iconUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="h-[20px] w-[20px] shrink-0 rounded-[4px] bg-white/90 object-contain p-[2px]"
                    loading="lazy"
                  />
                ) : null}
                <p
                  className="truncate text-[11.5px] font-bold leading-4"
                  style={{ color: item.muted ? 'var(--vz-muted,#8A8A8A)' : '#fff' }}
                >
                  {item.label}
                </p>
              </div>
              {item.sub ? (
                <p
                  className="mt-0.5 truncate text-[9px] uppercase tracking-[0.06em]"
                  style={{
                    color: item.muted ? 'var(--vz-muted,#A8A8A8)' : 'rgba(255,255,255,0.65)',
                  }}
                >
                  {item.sub}
                </p>
              ) : null}
              <div className="mt-auto flex min-w-0 items-baseline justify-between gap-1">
                <p
                  className="text-[14px] font-extrabold"
                  style={{ color: item.muted ? 'var(--vz-muted,#8A8A8A)' : '#fff' }}
                >
                  {item.valueLabel ?? item.value}
                </p>
                {item.badge ? (
                  <p className="truncate text-[8.5px] font-semibold uppercase tracking-[0.04em] text-white/75">
                    {item.badge}
                  </p>
                ) : null}
              </div>
            </>
          )
          const style = {
            width: `${(item.value / rowTotal) * 100}%`,
            backgroundColor: item.muted
              ? 'var(--vz-track,#EFEDEA)'
              : (item.color ?? defaultColor),
            opacity: item.muted ? 1 : 0.72 + 0.28 * (item.value / sorted[0].value),
          }
          const tip = `${item.label}${item.sub ? ' · ' + item.sub : ''} - ${item.valueLabel ?? item.value}${item.badge ? ' · ' + item.badge : ''}`
          const cls = 'vc-mark flex min-w-0 flex-col overflow-hidden px-2 py-1.5'
          return item.href ? (
            <a
              key={item.label}
              href={item.href}
              title={tip}
              className={cls + ' transition-[filter] hover:brightness-95'}
              style={style}
            >
              {inner}
            </a>
          ) : (
            <div key={item.label} title={tip} className={cls} style={style}>
              {inner}
            </div>
          )
        })}
      </div>
    )
  }
  return <div className="space-y-[3px]">{rowsArr.map((row, i) => renderRow(row, i))}</div>
}
