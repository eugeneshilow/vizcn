# AGENTS.md — how to use vizcn as a coding agent

> **Fleet canon (private perimeter law) — read first:**
> `~/Dropbox/5-code/hq/hq/AGENTS.md` — git-flow, quality gates, REPORT
> format. On conflict, the fleet canon wins. (Perimeter-local pointer;
> not applicable to external contributors.)


You are choosing a data visualization. vizcn is a catalog of finished SVG
forms; your job is **selection, not invention**.

## The frontier rule

1. State the question the reader must answer in 2 seconds (not "what data
   do I have" — "what must they understand").
2. Read [`catalog.json`](catalog.json): every form lists `question`,
   `family`, `whenToUse`, `antiUse`.
3. Pick the form whose `question` matches. Respect `antiUse` — it encodes
   real failure modes (e.g. `frontier-board` needs ≥2 runs per model; with
   single-point data use `rank-bars`).
4. **If no form fits — stop and ask the human.** Do not invent a new chart
   form or reach for a chart library.

## Install

Prerequisite: a shadcn-initialized project (`npx shadcn@latest init -d`).

```bash
npx shadcn@latest add https://vibecoding.tech/vizcn/r/<name>.json -y
```

This installs the component to `components/vizcn/<name>.tsx` and injects the
`--vz-*` tokens + series palette automatically. Namespace setup for
MCP-aware agents (browse/search the registry natively):

```json
// components.json
{ "registries": { "@vizcn": "https://vibecoding.tech/vizcn/r/{name}.json" } }
```

Then: `npx shadcn@latest add @vizcn/dune-flow`.

## Feeding data

- Data enters via props only; no form fetches anything.
- Series colors: pass `color` per series (color follows the entity), or
  omit — the neutral palette (`@/lib/vizcn-palette`) fills in. Ordinal
  series (tiers/priorities) take the `RAMP`, heat scales take `HEAT`.
- Demos (`<name>.demo.tsx` in the repo) are deterministic reference usage —
  copy their shape.
- Dark: tokens flip with your app's `.dark` class; use `.vz-terminal` for the
  terminal register or `.vz-paper` for the print/editorial register. None
  requires per-form work.

## Rules

- Never redefine `--vz-*` tokens inside a component; theme lives in the
  consumer's CSS.
- Never add a chart library "to extend" a form. Extend by composing forms.
- Keep demos deterministic: no `Math.random()`, no `Date.now()`.
