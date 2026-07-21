import { BubbleField } from './bubble-field'

export default function BubbleFieldDemo() {
  return (
    <BubbleField
      xLabel="GitHub stars"
      yLabel="Files in default branch"
      xLog
      yLog
      categories={[
        { key: 'typescript', label: 'TypeScript' },
        { key: 'go', label: 'Go' },
        { key: 'python', label: 'Python' },
        { key: 'javascript', label: 'JavaScript' },
        { key: 'rust', label: 'Rust' },
      ]}
      points={[
        { label: 'ts-router', x: 90000, y: 2100, size: 520, category: 'typescript' },
        { label: 'signal-kit', x: 54000, y: 860, size: 310, category: 'typescript' },
        { label: 'canvas-core', x: 27000, y: 3900, size: 470, category: 'typescript' },
        { label: 'typed-shell', x: 11800, y: 620, size: 180, category: 'typescript' },
        { label: 'node-ledger', x: 4300, y: 1280, size: 140, category: 'typescript' },
        { label: 'form-wire', x: 1300, y: 240, size: 64, category: 'typescript' },
        { label: 'go-proxy', x: 76000, y: 940, size: 280, category: 'go' },
        { label: 'cluster-watch', x: 31000, y: 1800, size: 250, category: 'go' },
        { label: 'tiny-store', x: 9200, y: 310, size: 120, category: 'go' },
        { label: 'queue-lab', x: 2800, y: 520, size: 96, category: 'go' },
        { label: 'packet-view', x: 700, y: 110, size: 42, category: 'go' },
        { label: 'py-agent', x: 68000, y: 7200, size: 610, category: 'python' },
        { label: 'data-craft', x: 42000, y: 3400, size: 430, category: 'python' },
        { label: 'prompt-eval', x: 15000, y: 890, size: 210, category: 'python' },
        { label: 'task-bench', x: 5200, y: 2700, size: 240, category: 'python' },
        { label: 'micro-orbit', x: 600, y: 160, size: 50, category: 'python' },
        { label: 'js-bundler', x: 47000, y: 1300, size: 260, category: 'javascript' },
        { label: 'web-hook', x: 19000, y: 430, size: 130, category: 'javascript' },
        { label: 'dom-scan', x: 3600, y: 760, size: 98, category: 'javascript' },
        { label: 'fetch-lite', x: 900, y: 80, size: 38, category: 'javascript' },
        { label: 'rust-cache', x: 61000, y: 960, size: 300, category: 'rust' },
        { label: 'safe-term', x: 22000, y: 4100, size: 350, category: 'rust' },
        { label: 'byte-index', x: 6800, y: 1500, size: 160, category: 'rust' },
        { label: 'mini-wasm', x: 1700, y: 190, size: 70, category: 'rust' },
      ]}
    />
  )
}
