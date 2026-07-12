/**
 * vizcn registry generator — the single-source build step.
 *
 * Reads registry/<name>/{meta.json,<name>.tsx} + lib/palette.ts + theme.css
 * and emits, with the base URL injected from registry.config.json:
 *   r/<name>.json   — shadcn registry-item (component, absolute-URL deps)
 *   r/theme.json    — cssVars (light/dark) + terminal class parsed from theme.css
 *   r/palette.json  — lib item (series palette, installed to lib/vizcn-palette.ts)
 *   r/motion.json   — optional motion CSS (registry:file)
 *   r/registry.json — root index
 *   catalog.json    — the agent-facing catalog (question/family/when/anti)
 *   llms.txt        — plain-text index for LLM crawlers (forms + install URLs)
 *   README.md       — catalog table refreshed between <!-- catalog --> markers
 *
 * Sources never hardcode shelf URLs (injection invariant): forks edit
 * registry.config.json only.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const cfg = JSON.parse(readFileSync(join(root, 'registry.config.json'), 'utf8'))
const BASE = cfg.registryBase.replace(/\/$/, '')
const outDir = join(root, 'r')
// r/ is fully derived: wipe before build, otherwise JSONs of removed
// forms survive catalog recuts
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

// ---- theme: parse --vz-* tokens out of theme.css ----
const themeCss = readFileSync(join(root, 'theme.css'), 'utf8')
function parseVars(block) {
  const m = themeCss.match(block)
  if (!m) return {}
  const vars = {}
  for (const [, k, v] of m[1].matchAll(/--(vz-[\w-]+):\s*([^;]+);/g)) vars[k] = v.trim()
  return vars
}
const terminalVars = parseVars(/\.vz-terminal\s*{([\s\S]*?)}/)
const themeItem = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'theme',
  type: 'registry:theme',
  title: 'vizcn theme tokens',
  description:
    'Structural --vz-* tokens (light + dark + terminal). Namespaced: installing vizcn never repaints your app.',
  cssVars: {
    light: parseVars(/:root\s*{([\s\S]*?)}/),
    dark: parseVars(/\.vz-dark\s*{([\s\S]*?)}/),
  },
  css: {
    '.vz-terminal': {
      ...Object.fromEntries(Object.entries(terminalVars).map(([key, value]) => [`--${key}`, value])),
      'color-scheme': 'dark',
    },
  },
}
writeFileSync(join(outDir, 'theme.json'), JSON.stringify(themeItem, null, 2))

// ---- palette: series colors as a lib item ----
const paletteItem = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'palette',
  type: 'registry:lib',
  title: 'vizcn series palette',
  description: 'Brand-neutral categorical/ordinal series colors (seriesColor, RAMP, HEAT).',
  files: [
    {
      path: 'lib/palette.ts',
      content: readFileSync(join(root, 'lib/palette.ts'), 'utf8'),
      type: 'registry:lib',
      target: 'lib/vizcn-palette.ts',
    },
  ],
}
writeFileSync(join(outDir, 'palette.json'), JSON.stringify(paletteItem, null, 2))

// ---- motion: optional pure-CSS kit ----
const motionItem = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'motion',
  type: 'registry:item',
  title: 'vizcn motion (optional)',
  description: 'Pure-CSS entrance/interaction kit (vc-* classes). Forms render fine without it.',
  files: [
    {
      path: 'motion.css',
      content: readFileSync(join(root, 'motion.css'), 'utf8'),
      type: 'registry:file',
      target: 'styles/vizcn-motion.css',
    },
  ],
}
writeFileSync(join(outDir, 'motion.json'), JSON.stringify(motionItem, null, 2))

// ---- forms ----
const formsDir = join(root, 'registry')
const names = readdirSync(formsDir).filter((n) => existsSync(join(formsDir, n, 'meta.json')))
const catalog = []
const indexItems = [
  { name: 'theme', type: themeItem.type, title: themeItem.title, description: themeItem.description },
  { name: 'palette', type: paletteItem.type, title: paletteItem.title, description: paletteItem.description },
  { name: 'motion', type: motionItem.type, title: motionItem.title, description: motionItem.description },
]

for (const name of names.sort()) {
  const meta = JSON.parse(readFileSync(join(formsDir, name, 'meta.json'), 'utf8'))
  let content = readFileSync(join(formsDir, name, `${name}.tsx`), 'utf8')
  const usesPalette = /from\s+["']\.\.\/\.\.\/lib\/palette["']/.test(content)
  // consumer-side import path (shadcn @/* alias)
  content = content.replace(/from\s+["']\.\.\/\.\.\/lib\/palette["']/g, 'from "@/lib/vizcn-palette"')
  const deps = [`${BASE}/theme.json`]
  if (usesPalette) deps.push(`${BASE}/palette.json`)
  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name,
    type: 'registry:component',
    title: meta.title,
    description: meta.description,
    registryDependencies: deps,
    files: [
      { path: `registry/${name}/${name}.tsx`, content, type: 'registry:component', target: `components/vizcn/${name}.tsx` },
    ],
    meta: { question: meta.question, family: meta.family, whenToUse: meta.whenToUse, antiUse: meta.antiUse },
  }
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(item, null, 2))
  indexItems.push({ name, type: item.type, title: meta.title, description: meta.description })
  catalog.push({
    name,
    install: `${BASE}/${name}.json`,
    question: meta.question,
    family: meta.family,
    whenToUse: meta.whenToUse,
    antiUse: meta.antiUse,
    client: meta.client,
    props: meta.props,
  })
}

// ---- root index + catalog ----
writeFileSync(
  join(outDir, 'registry.json'),
  JSON.stringify(
    { $schema: 'https://ui.shadcn.com/schema/registry.json', name: cfg.name, homepage: cfg.shelfUrl, items: indexItems },
    null,
    2,
  ),
)
writeFileSync(join(root, 'catalog.json'), JSON.stringify({ name: cfg.name, shelf: cfg.shelfUrl, forms: catalog }, null, 2))

// ---- cli/shelf.json: URLs for the pointer CLI (npx vizcn) ----
writeFileSync(
  join(root, 'cli/shelf.json'),
  JSON.stringify({ shelfUrl: cfg.shelfUrl, registryBase: BASE }, null, 2) + '\n',
)

// ---- llms.txt: plain-text index for LLM crawlers ----
const llmsForms = catalog
  .map((c) => `- ${c.name} — ${c.question} · install: ${c.install}`)
  .join('\n')
writeFileSync(
  join(root, 'llms.txt'),
  `# ${cfg.name} — agent-first SVG viz registry

Copy-paste SVG data-viz forms an AI coding agent assembles from a catalog. No chart libraries.
${catalog.length} forms; each declares the question it answers, whenToUse, and antiUse.
Catalog (machine-readable): ${cfg.shelfUrl}/catalog.json
Install: npx shadcn@latest add ${BASE}/<name>.json
Or: npx ${cfg.name} add <name> (pointer CLI; \`npx ${cfg.name} prompt\` prints an agent-ready prompt)
Repo: https://github.com/${cfg.author}/${cfg.name}

## Forms

${llmsForms}
`,
)

// ---- README catalog table between markers ----
const readmePath = join(root, 'README.md')
if (existsSync(readmePath)) {
  const rows = catalog
    .map((c) => `| \`${c.name}\` | ${c.question} | ${c.family} | ${c.antiUse} |`)
    .join('\n')
  const table = `| form | answers the question | family | when NOT to use |\n| --- | --- | --- | --- |\n${rows}`
  const readme = readFileSync(readmePath, 'utf8')
  writeFileSync(
    readmePath,
    readme.replace(/<!-- catalog:start -->[\s\S]*<!-- catalog:end -->/, `<!-- catalog:start -->\n${table}\n<!-- catalog:end -->`),
  )
}

console.log(`built ${names.length} forms + theme/palette/motion → r/ · catalog.json · llms.txt · README table (base: ${BASE})`)
