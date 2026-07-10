import { seriesColor } from '../../lib/palette'
import {
  FrontierBoard,
  type FrontierMetric,
  type FrontierVersion,
} from './frontier-board'

/**
 * Deterministic, brand-neutral demo for FrontierBoard.
 * Invented series (Atlas / Nova / Orion / Vega / Lumen) across two dataset
 * versions and two X metrics (Cost / Steps). Colors come from seriesColor(i).
 */

const metrics: FrontierMetric[] = [
  {
    key: 'cost',
    label: 'Cost',
    axisLabel: 'Average cost per task',
    tickPrefix: '$',
  },
  {
    key: 'steps',
    label: 'Steps',
    axisLabel: 'Average steps per task',
  },
]

const versions: FrontierVersion[] = [
  {
    key: 'v1',
    label: 'v1.0',
    models: [
      {
        id: 'Atlas',
        color: seriesColor(0),
        runs: [
          { variant: 'low', score: 41, x: { cost: 4.2, steps: 22 } },
          {
            variant: 'high',
            score: 58,
            x: { cost: 18.6, steps: 61 },
            labeled: true,
            isDefault: true,
          },
        ],
      },
      {
        id: 'Nova',
        color: seriesColor(1),
        runs: [
          { variant: 'low', score: 47, x: { cost: 6.1, steps: 28 } },
          {
            variant: 'high',
            score: 66,
            x: { cost: 22.4, steps: 72 },
            labeled: true,
          },
        ],
      },
      {
        id: 'Orion',
        color: seriesColor(2),
        runs: [
          {
            score: 53,
            x: { cost: 9.8, steps: 40 },
            labeled: true,
            isDefault: true,
          },
        ],
      },
      {
        id: 'Vega',
        color: seriesColor(3),
        runs: [
          { variant: 'low', score: 38, x: { cost: 3.4, steps: 18 } },
          {
            variant: 'high',
            score: 61,
            x: { cost: 15.2, steps: 55 },
            labeled: true,
            labelDx: -14,
            labelDy: -10,
          },
        ],
      },
      {
        id: 'Lumen',
        color: seriesColor(4),
        runs: [
          {
            score: 44,
            x: { cost: 12.7, steps: 46 },
            labeled: true,
          },
        ],
      },
    ],
  },
  {
    key: 'v2',
    label: 'v1.1',
    models: [
      {
        id: 'Atlas',
        color: seriesColor(0),
        runs: [
          { variant: 'low', score: 49, x: { cost: 3.9, steps: 20 } },
          {
            variant: 'high',
            score: 67,
            x: { cost: 16.1, steps: 57 },
            labeled: true,
            isDefault: true,
          },
        ],
      },
      {
        id: 'Nova',
        color: seriesColor(1),
        runs: [
          { variant: 'low', score: 55, x: { cost: 5.5, steps: 25 } },
          {
            variant: 'high',
            score: 74,
            x: { cost: 20.8, steps: 68 },
            labeled: true,
          },
        ],
      },
      {
        id: 'Orion',
        color: seriesColor(2),
        runs: [
          { variant: 'low', score: 51, x: { cost: 7.2, steps: 31 } },
          {
            variant: 'high',
            score: 63,
            x: { cost: 13.9, steps: 49 },
            labeled: true,
            isDefault: true,
          },
        ],
      },
      {
        id: 'Vega',
        color: seriesColor(3),
        runs: [
          {
            variant: 'high',
            score: 69,
            x: { cost: 11.4, steps: 44 },
            labeled: true,
            labelDx: -14,
            labelDy: -10,
          },
        ],
      },
      {
        id: 'Lumen',
        color: seriesColor(4),
        runs: [
          {
            score: 52,
            x: { cost: 10.1, steps: 42 },
            labeled: true,
          },
        ],
      },
    ],
  },
]

export default function FrontierBoardDemo() {
  return (
    <FrontierBoard
      title="Agent score"
      meta="120 tasks · updated Q3"
      versions={versions}
      metrics={metrics}
      yTickSuffix="%"
      subjectId="Nova"
    />
  )
}
