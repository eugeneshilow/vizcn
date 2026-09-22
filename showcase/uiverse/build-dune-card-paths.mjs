import fs from 'node:fs'
const d = JSON.parse(fs.readFileSync(process.argv[2] ?? 'dune-live.json', 'utf8'))
const END = '2026-09-19'
const n = d.days.indexOf(END) + 1
const series = d.series.map((s) => ({ ...s, values: s.values.slice(0, n) }))
const r2 = (v) => Math.round(v * 10) / 10
function basisPath(pts) {
  const m = pts.length
  const bez = (a, b, c) => `C${r2((2*a.x+b.x)/3)},${r2((2*a.y+b.y)/3)},${r2((a.x+2*b.x)/3)},${r2((a.y+2*b.y)/3)},${r2((a.x+4*b.x+c.x)/6)},${r2((a.y+4*b.y+c.y)/6)}`
  let p = `M${r2(pts[0].x)},${r2(pts[0].y)}L${r2((5*pts[0].x+pts[1].x)/6)},${r2((5*pts[0].y+pts[1].y)/6)}`
  for (let i = 2; i < m; i++) p += bez(pts[i-2], pts[i-1], pts[i])
  p += bez(pts[m-2], pts[m-1], pts[m-1])
  p += `L${r2(pts[m-1].x)},${r2(pts[m-1].y)}`
  return p
}
const W = 960, H = 200, top = 6, endX = 0.88
const boundaries = [Array.from({ length: n }, () => 0)]
for (const s of series) { const prev = boundaries[boundaries.length-1]; boundaries.push(prev.map((b,i)=>b+(s.values[i]??0))) }
const totals = boundaries[boundaries.length-1]
const yMax = Math.max(...totals)
const sx = (i) => (i/(n-1)) * W * endX
const sy = (v) => top + (1 - v/yMax) * (H - top)
const layers = series.map((s,k) => {
  const pts = boundaries[k+1].map((v,i)=>({x:sx(i),y:sy(v)}))
  return { label: s.label, color: s.color, d: `${basisPath(pts)}L${r2(sx(n-1))},${r2(sy(0))}L0,${r2(sy(0))}Z` }
}).reverse()
const crest = totals.map((v,i)=>({x:sx(i),y:sy(v)}))
const endPt = crest[crest.length-1]
// ghost of the future: echo of the last days past today
const dayW = sx(1)
const future = Math.ceil((W - W*endX)/dayW) + 2
const gpts = []
for (let i=0;i<future;i++){ const echo = totals[n-future+i] ?? 0; const w = i/(future-1); gpts.push({x: W*endX + i*dayW, y: sy(totals[n-1]*(1-w)+echo*w)}) }
const ghost = `${basisPath(gpts)}L${r2(gpts[gpts.length-1].x)},${r2(sy(0))}L${r2(W*endX)},${r2(sy(0))}Z`
fs.writeFileSync('paths.json', JSON.stringify({ layers, endPt, ghost, total: totals.reduce((a,b)=>a+b,0), last: totals[n-1], days: n }, null, 1))
console.log('layers', layers.length, 'endPt', endPt, 'total', totals.reduce((a,b)=>a+b,0), 'yMax', yMax, 'pathlen', layers[0].d.length)
