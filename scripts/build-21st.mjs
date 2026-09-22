// Build self-contained (component + demo) pairs for the 21st.dev mirror.
// 21st's publish CLI accepts exactly one component file and one demo file per
// component (no extra local files, no registry dependencies), so lib/palette.ts
// is inlined into every file that imports it. Output: dist/21st/<name>/
// (gitignored) + dist/21st/manifest.json consumed by scripts/publish-21st.sh.
// The canonical registry stays https://vibecoding.tech/vizcn — 21st is a mirror.
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const out = path.resolve(process.argv[2] ?? 'dist/21st')
const shelf = JSON.parse(fs.readFileSync(path.join(root, 'registry.config.json'), 'utf8')).shelfUrl
const palette = fs.readFileSync(path.join(root, 'lib/palette.ts'), 'utf8')
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'))

const pick = (re) => {
  const m = palette.match(re)
  if (!m) throw new Error(`palette.ts: pattern not found ${re}`)
  return m[0].replace(/^export /, '')
}
const inlineBlock = (names) => {
  const parts = [`// --- vizcn palette (lib/palette.ts inlined for the 21st.dev mirror; canonical registry: ${shelf}) ---`]
  if (names.includes('seriesColor') || names.includes('CATEGORICAL')) {
    parts.push(pick(/export const CATEGORICAL[\s\S]*?\] as const/))
    parts.push(pick(/export function seriesColor[\s\S]*?\n}/))
  }
  if (names.includes('RAMP')) parts.push(pick(/export const RAMP[^\n]*/))
  if (names.includes('HEAT')) parts.push(pick(/export const HEAT[^\n]*/))
  parts.push('// --- end palette ---')
  return parts.join('\n')
}
const PALETTE_IMPORT = /^import \{([^}]+)\} from '\.\.\/\.\.\/lib\/palette'\n/m
const inline = (src) => {
  const m = src.match(PALETTE_IMPORT)
  if (!m) return src
  const names = m[1].split(',').map((s) => s.trim())
  return src.replace(PALETTE_IMPORT, inlineBlock(names) + '\n')
}

const manifest = []
for (const form of catalog.forms) {
  const n = form.name
  const dir = path.join(root, 'registry', n)
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'))
  const comp = inline(fs.readFileSync(path.join(dir, `${n}.tsx`), 'utf8'))
  const demo = inline(fs.readFileSync(path.join(dir, `${n}.demo.tsx`), 'utf8'))
  if (/from '\.\.\/\.\.\/lib\/palette'/.test(comp + demo)) throw new Error(`palette import left in ${n}`)
  const od = path.join(out, n)
  fs.mkdirSync(od, { recursive: true })
  fs.writeFileSync(path.join(od, `${n}.tsx`), comp)
  fs.writeFileSync(path.join(od, `${n}.demo.tsx`), demo)
  manifest.push({
    name: n,
    title: meta.title,
    family: meta.family,
    description: `${meta.description} Answers: "${meta.question}" Part of vizcn by vibecoding.tech — agent-first SVG viz forms, no chart libraries.`,
  })
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`built ${manifest.length} pairs → ${path.relative(root, out)}`)
