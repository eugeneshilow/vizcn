# vizcn

**An SVG viz registry built for coding agents first.** Copy-paste forms your
AI agent assembles from a catalog — shadcn-style, zero chart libraries
(no d3, no recharts: every form is hand-drawn inline SVG).

Instead of teaching your agent to invent charts, give it a **catalog of
named forms** and one rule: *pick the form by the question the reader must
answer in 2 seconds — never invent a new one.* The catalog is machine-readable
([`catalog.json`](catalog.json)), the rule ships in [`AGENTS.md`](AGENTS.md).

## Install (exactly like shadcn)

```bash
npx shadcn@latest add https://vibecoding.tech/vizcn/r/dune-flow.json
```

Tokens (`--vz-*`, namespaced — installing vizcn never repaints your app) and
the series palette come along automatically via registry dependencies.
Optional motion kit: `npx shadcn@latest add https://vibecoding.tech/vizcn/r/motion.json`.

Agent-native: add the namespace to `components.json` and any shadcn-MCP-aware
agent can browse and install the catalog itself —

```json
{ "registries": { "@vizcn": "https://vibecoding.tech/vizcn/r/{name}.json" } }
```

## Catalog

<!-- catalog:start -->
| form | answers the question | family | when NOT to use |
| --- | --- | --- | --- |
| `bench-matrix` | How do these models compare across many benchmarks at once? | matrix | Trends over time or more than ~6 models — use a time-series form or a ranking board instead of a wide table. |
| `delta-bars` | Who is ahead today, and by how much? | time-series | Not for more than 2 rivals or for absolute magnitudes — use race lines or stacked forms instead. |
| `dumbbell-range` | How far apart are the two values per row, and who sits where? | ranking/comparison | Not for more than 2 points per row (use a range strip or box plot) and not for time series — use lines. |
| `dune-flow` | What made up the flow over time, and when were the waves? | time-series | When readers must read exact values off the chart — the B-spline deliberately does not pass through the data points (raw values live only in the tooltip). |
| `frontier-board` | Which model delivers the most score per dollar (or token), and at what effort level? | ranking | Needs >=2 runs per model to draw frontier lines; single-point-per-model data reads better as rank-bars. |
| `heat-strip` | Is this thing alive — how did its activity move over the last year? | time-series | Not for exact value reading or short ranges (<12 weeks) — use a column chart instead. |
| `leaderboard-table` | Who leads on score, with what confidence spread, and what does that score cost? | ranking | Wide-figure genre (min-width ~700px) — not for narrow containers or mobile cards; for a single metric without spread or economy columns, rank-bars is lighter. |
| `rank-bars` | Who leads this ranking, and by how much? | ranking | Not for time series, part-to-whole composition, or more than ~10 rows — use a table or sparklines instead. |
| `stacked-activity` | What makes up each day's volume, and how does it breathe day to day? | time-series | Comparing exact values of individual segments across days (inner segments have no common baseline) or fewer than 5 days. |
| `treemap` | How is the whole split up, and who dominates? | composition | Not for close values (areas are hard to compare precisely) or deep hierarchies (flat only) — use rank bars or a nested treemap library instead. |
| `value-columns` | How do these few values stack up side by side? | ranking | Not for many items (>8) or time series — use rank bars or lines instead. |
<!-- catalog:end -->

## Usage

Data goes in via props; every component ships with a deterministic demo
(`registry/<name>/<name>.demo.tsx`). Dark tone: tokens flip with your `.dark`
class. Colors follow your entities — pass `color` per series, or the neutral
palette steps in.

## Maintenance

Curated static snapshot: copy-paste, no runtime dependency, nothing to
upgrade. Issues are open for bug reports on the forms; PRs may lag — this
registry is a byproduct of a production system, not a product team.

## Author

Built by [Evgeny Shilov](https://github.com/eugeneshilow) ·
[@eugeneshilow](https://x.com/eugeneshilow) · next drops:
[vibecoding.tech/vizcn](https://vibecoding.tech/vizcn)

Not affiliated with [shadcn](https://ui.shadcn.com) — vizcn is an
independent registry that follows the shadcn registry spec.
