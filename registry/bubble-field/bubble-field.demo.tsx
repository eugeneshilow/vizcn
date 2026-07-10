import { BubbleScatterPlot } from './bubble-field'

export default function BubbleFieldDemo() {
  return (
    <div className="mx-auto w-full max-w-[880px]">
      <p className="mb-4 text-[13px] font-semibold text-[var(--vz-ink,#111)]">
        Eval suites · corpus size vs monthly runs, bubble = models evaluated
      </p>
      <BubbleScatterPlot
        xLabel="Corpus size (examples)"
        yLabel="Monthly evaluation runs"
        legendUnit="models"
        points={[
          { label: 'Atlas 4', series: 'Coding', x: 42000, y: 18000, size: 320 },
          { label: 'Nova Max', series: 'Coding', x: 8500, y: 5200, size: 190 },
          { label: 'Orion Pro', series: 'Reasoning', x: 2400, y: 9800, size: 240 },
          { label: 'Vega 2', series: 'Reasoning', x: 600, y: 1500, size: 90 },
          { label: 'Lumen', series: 'Math', x: 350, y: 420, size: 60 },
          { label: 'Atlas Mini', series: 'Math', x: 1200, y: 800, size: 75 },
          { label: 'Orion S', series: 'Vision', x: 15000, y: 2600, size: 130 },
          { label: 'Vega Agent', series: 'Agentic', x: 500, y: 4200, size: 110 },
        ]}
      />
    </div>
  )
}
