/**
 * vizcn series palette — brand-neutral, colorblind-tested categorical hues.
 *
 * Color follows the entity: pass an explicit `color` per series in your
 * data, or fall back to seriesColor(i) for a stable per-index hue. Forms
 * never hardcode series colors — swap this file (or pass your own hexes)
 * to re-brand every demo at once.
 *
 * Structural colors (surface/grid/axis/ink) are CSS tokens in theme.css;
 * semantic status (good/mid/bad) lives there too. This file is only the
 * categorical/ordinal series layer.
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

/**
 * Single-hue light→dark ramp for ORDINAL series (priorities, tiers,
 * intensity). Ordered data lies with categorical hues — use the ramp.
 */
export const RAMP = ['#8EB4D8', '#4E79A7', '#2E4C6D'] as const

/** Sequential 5-step ramp for heat/intensity scales (stripes, calendars). */
export const HEAT = ['#EDF2F7', '#B9D0E8', '#7FA7CD', '#4E79A7', '#2E4C6D'] as const
