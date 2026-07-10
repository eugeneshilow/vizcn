import { WarmingStripes } from './warming-stripes'

/**
 * Deterministic, brand-neutral demo: a generic "signal intensity" ribbon across
 * a long span, with invented eras. No real names, no randomness.
 */
export default function WarmingStripesDemo() {
  return (
    <WarmingStripes
      from={1940}
      to={2024}
      eras={[
        { start: 1940, end: 1968, heat: 0, label: 'Тихая эпоха' },
        { start: 1969, end: 1988, heat: 1 },
        { start: 1989, end: 2007, heat: 2, label: 'Подъём' },
        { start: 2008, end: 2015, heat: 1, label: 'Плато' },
        { start: 2016, end: 2024, heat: 3, label: 'Пик активности' },
      ]}
      note="Одна полоса — один год; цвет — интенсивность сигнала (холод → жара). Демо-данные."
    />
  )
}
