/**
 * vizcn categorical palette — brand-neutral, colorblind-safe series colors.
 * Color follows the entity: pass an explicit `color` on your data, or fall
 * back to `seriesColor(i)` for a stable per-index hue. Swap these for your
 * own brand palette — the forms read whatever color you hand them.
 *
 * Structural colors (surface / grid / axis / ink…) live in theme.css as
 * --vz-* CSS variables. Semantic status (good / mid / bad) is there too.
 */
export const CATEGORICAL = [
  '#4E79A7', // blue
  '#F28E2B', // orange
  '#59A14F', // green
  '#B07AA1', // purple
  '#76B7B2', // teal
  '#E15759', // red
  '#EDC948', // yellow
  '#FF9DA7', // pink
  '#9C755F', // brown
  '#BAB0AC', // grey
] as const

/** Stable color for series index i (wraps around the palette). */
export function seriesColor(i: number): string {
  return CATEGORICAL[((i % CATEGORICAL.length) + CATEGORICAL.length) % CATEGORICAL.length]
}

/** Single-hue light→dark ramp for ordinal series (priorities, tiers). */
export const RAMP = ['#8EB4D8', '#4E79A7', '#2E4C6D'] as const
