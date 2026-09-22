'use client'

import { DuneAreaChart, type DuneSeries, fmtDay } from './dune-flow'

/**
 * Hero demo — the landscape register. Real data: commits per day on the
 * vibecoding.ru main branch, by kind of work, since 2026-07-01 (a site built
 * by a machine of coding agents; the live version runs at vibecoding.ru/open).
 * chrome="bare" strips axes and legend, entrance="pen" draws the crest with a
 * pen, dataEndX parks "today" short of the right edge and paints a grey
 * ghost of the recent shape past it. Hover the dunes for the day's mix.
 */

const DAYS = [
  '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08',
  '2026-07-09', '2026-07-10', '2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16',
  '2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24',
  '2026-07-25', '2026-07-26', '2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31', '2026-08-01',
  '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09',
  '2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16', '2026-08-17',
  '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24', '2026-08-25',
  '2026-08-26', '2026-08-27', '2026-08-28', '2026-08-29', '2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02',
  '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10',
  '2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18',
  '2026-09-19',
]

const WAVES: Array<{ label: string; color: string; values: number[] }> = [
  {
    label: 'Docs',
    color: '#0071E3',
    values: [
      5, 42, 97, 42, 56, 43, 56, 29, 49, 94, 96, 81, 63, 49, 58, 77, 86, 37, 54, 46, 36, 22, 24, 11, 13, 13, 18, 11, 4, 7, 1, 14, 23, 20, 27, 8, 13, 13, 1, 8, 17, 19, 13, 12, 22, 12, 14, 29, 6, 13, 13, 30, 37, 18, 9, 9, 5, 6, 12, 4, 7, 5, 3, 16, 9, 12, 19, 16, 30, 27, 9, 12, 7, 6, 9, 5, 2, 0, 15, 1, 5,
    ],
  },
  {
    label: 'Journal',
    color: '#3FD8B8',
    values: [
      0, 0, 0, 18, 28, 18, 23, 24, 22, 30, 37, 49, 39, 35, 44, 26, 43, 37, 42, 47, 32, 28, 16, 12, 9, 16, 14, 0, 5, 5, 2, 7, 13, 20, 17, 6, 2, 10, 4, 9, 6, 4, 12, 11, 33, 12, 10, 16, 27, 19, 14, 18, 15, 9, 3, 16, 8, 6, 25, 16, 5, 24, 6, 35, 57, 12, 17, 54, 40, 31, 21, 43, 22, 6, 12, 17, 3, 1, 19, 0, 24,
    ],
  },
  {
    label: 'Frontend',
    color: '#BA62FC',
    values: [
      0, 25, 11, 16, 42, 6, 23, 12, 19, 1, 2, 3, 0, 1, 0, 0, 6, 9, 0, 2, 20, 1, 2, 2, 0, 0, 11, 2, 10, 5, 1, 13, 16, 10, 5, 2, 0, 21, 65, 40, 52, 34, 10, 40, 29, 44, 45, 6, 14, 0, 9, 10, 11, 5, 4, 18, 17, 5, 24, 57, 67, 26, 9, 17, 2, 3, 11, 81, 32, 6, 8, 2, 21, 8, 3, 5, 11, 1, 7, 0, 3,
    ],
  },
  {
    label: 'Backend',
    color: '#6DD400',
    values: [
      0, 8, 2, 10, 18, 11, 17, 21, 6, 6, 9, 13, 11, 2, 0, 0, 6, 14, 7, 13, 9, 17, 1, 12, 34, 17, 3, 1, 5, 14, 9, 21, 29, 3, 26, 16, 6, 6, 1, 5, 7, 7, 4, 13, 5, 21, 3, 8, 9, 4, 13, 7, 5, 6, 11, 1, 3, 12, 8, 3, 0, 2, 4, 14, 10, 11, 9, 8, 22, 19, 15, 21, 15, 15, 4, 5, 6, 0, 10, 1, 0,
    ],
  },
  {
    label: 'Admin',
    color: '#FF2E54',
    values: [
      0, 4, 0, 0, 3, 2, 1, 1, 10, 9, 2, 0, 0, 0, 0, 0, 8, 2, 6, 9, 4, 18, 13, 12, 4, 2, 0, 0, 2, 5, 5, 4, 1, 0, 6, 5, 2, 6, 0, 7, 8, 0, 0, 2, 1, 7, 1, 2, 0, 5, 4, 0, 1, 1, 0, 4, 0, 5, 3, 0, 2, 0, 0, 6, 5, 2, 6, 1, 11, 1, 3, 7, 3, 1, 0, 2, 0, 0, 3, 0, 0,
    ],
  },
  {
    label: 'CI/CD',
    color: '#45657D',
    values: [
      0, 2, 1, 0, 0, 0, 3, 1, 1, 3, 3, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 1, 1, 2, 2, 1, 1, 4, 0, 0, 0, 0, 1, 1, 0, 2, 0, 1, 0, 2, 4, 4, 2, 5, 3, 0, 3, 0, 0, 0, 1, 4, 4, 0, 0, 1, 2, 1, 0, 0, 2, 2, 0, 2, 2, 0, 1, 0, 0, 0, 4, 3, 1, 3, 0, 2, 3, 0, 0, 0, 0,
    ],
  },
]

const SERIES: DuneSeries[] = WAVES

const TOTAL = 5739

const LAST_TOTAL = 32

const AMBER = '#FF7A1A'

export default function DuneFlowHeroDemo() {
  const lastDay = DAYS[DAYS.length - 1]
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] font-sans text-white antialiased"
      style={{ background: '#000000', height: 520 }}
    >
      <div className="relative z-10 px-8 pt-8 sm:px-10 sm:pt-10">
        <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
          <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: '#3FD8B8' }} />
          Agentic build · live
        </p>
        <h2 className="max-w-[640px] text-[30px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[38px]">
          vibecoding.ru is built by a machine of agents.
        </h2>
        <p className="mt-3 max-w-[560px] text-[15px] leading-[1.45] text-white/55">
          {TOTAL.toLocaleString('en-US')} commits in {DAYS.length} days — one wave per kind of
          work. Hover the dunes for a day&apos;s mix.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-white/60">
          {WAVES.map((w) => (
            <span key={w.label} className="flex items-center gap-1.5">
              <span className="inline-block h-[8px] w-[8px] rounded-full" style={{ background: w.color }} />
              {w.label}
            </span>
          ))}
        </div>
      </div>

      {/* the landscape: bleeds past both edges, rises from the stage floor */}
      <div className="absolute bottom-0 -left-[6%] -right-[6%] h-[250px]">
        <DuneAreaChart
          stretch
          chrome="bare"
          height={200}
          entrance="pen"
          penColor={AMBER}
          dataEndX={0.86}
          stage="#000000"
          days={DAYS}
          series={SERIES}
          penHoverLabel={`${fmtDay(lastDay)} · ${LAST_TOTAL} commits`}
          yLabel="Commits per day by kind of work, vibecoding.ru main branch"
        />
      </div>
    </div>
  )
}
