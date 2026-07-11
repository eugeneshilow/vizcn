#!/usr/bin/env node
// vizcn pointer CLI. The registry itself lives on the shelf (shelf.json is
// generated from registry.config.json — the single home of all URLs).
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const { shelfUrl, registryBase } = JSON.parse(
  readFileSync(new URL('./shelf.json', import.meta.url), 'utf8'),
)

const PROMPT = `Add a data visualization to this project from the vizcn registry:

1. Fetch ${shelfUrl}/catalog.json — every form declares the
   question it answers, whenToUse, and antiUse.
2. Pick the form whose question matches what my data needs to answer.
   Respect antiUse. If no form fits, stop and ask — never invent a chart.
3. Install: npx shadcn@latest add ${registryBase}/<name>.json
   (no shadcn in the project? run \`npx shadcn@latest init -d\` once,
   or copy the form file from the repo).
4. Feed my real data via props — the demo data is fictional reference.`

async function list() {
  try {
    const res = await fetch(`${shelfUrl}/catalog.json`)
    const { forms } = await res.json()
    console.log(`vizcn — agent-first SVG viz registry · ${forms.length} forms\n`)
    const pad = Math.max(...forms.map((f) => f.name.length)) + 2
    for (const f of forms) console.log(`  ${f.name.padEnd(pad)}${f.question}`)
    console.log(`
install   npx vizcn add <name>
          npx shadcn@latest add ${registryBase}/<name>.json
agents    npx vizcn prompt   (paste the output into your coding agent)
shelf     ${shelfUrl}`)
  } catch {
    console.log(`vizcn — agent-first SVG viz registry`)
    console.log(`shelf:   ${shelfUrl}`)
    console.log(`catalog: ${shelfUrl}/catalog.json (couldn't fetch it right now)`)
  }
}

const [cmd, ...args] = process.argv.slice(2)

if (cmd === 'add' && args.length > 0) {
  for (const name of args) {
    const item = `${registryBase}/${name.replace(/\.json$/, '')}.json`
    const r = spawnSync('npx', ['shadcn@latest', 'add', item], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    if (r.status) process.exit(r.status)
  }
} else if (cmd === 'prompt') {
  console.log(PROMPT)
} else if (cmd === 'add') {
  console.error('usage: npx vizcn add <form-name> — see `npx vizcn` for the list')
  process.exit(1)
} else {
  await list()
}
