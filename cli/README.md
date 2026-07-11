# vizcn

Agent-first SVG viz registry. **This package is a pointer CLI** — the
registry itself lives at [vibecoding.tech/vizcn](https://vibecoding.tech/vizcn):
copy-paste React + inline-SVG forms (no chart libraries) that an AI coding
agent picks from a catalog by the question the data answers.

```bash
npx vizcn              # list the forms
npx vizcn add <name>   # install one (wraps shadcn add)
npx vizcn prompt       # print a ready-made prompt for your coding agent
```

Equivalent direct install (any shadcn-initialized project):

```bash
npx shadcn@latest add https://vibecoding.tech/vizcn/r/<name>.json
```

Machine-readable catalog with per-form `question` / `whenToUse` / `antiUse`:
[catalog.json](https://vibecoding.tech/vizcn/catalog.json) ·
Repo: [github.com/eugeneshilow/vizcn](https://github.com/eugeneshilow/vizcn)

Not affiliated with shadcn — an independent registry following the shadcn
registry spec.
