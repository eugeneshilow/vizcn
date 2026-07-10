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
| `bubble-field` | How do entities spread across two count dimensions, and which are the heavyweights? | matrix | Log-log count data spanning decades only — not linear data; skip it for narrow ranges, negative/zero values, or a single dimension. |
| `distribution-bar` | How does the whole split into parts? | composition | Comparing values across multiple groups or over time — use a ranking bar list or time series instead; also avoid with many tiny segments that all fall below the label threshold. |
| `dune-flow` | What made up the flow over time, and when were the waves? | time-series | When readers must read exact values off the chart — the B-spline deliberately does not pass through the data points (raw values live only in the tooltip). |
| `frontier-board` | Which model delivers the most score per dollar (or token), and at what effort level? | ranking | Needs >=2 runs per model to draw frontier lines; single-point-per-model data reads better as rank-bars. |
| `pipeline-flow` | What are the stages of this process, and in what order does work flow? | illustration | Not for branching/looping flows or quantitative comparison between stages — no values are encoded. |
| `race-lines` | Who is pulling ahead over time, and by how much on any given day? | time-series | Few data points (<8), many series (>6, tooltip and lines turn to spaghetti), or when only the latest value matters (use a ranking bar instead). |
| `radar-profile` | Where does A beat B, and where does it lose? | matrix | Exactly 2 entities on a 0-100 scale only — not for 3+ overlapping shapes, unnormalized metrics, or precise value reading (use rank bars or a table). |
| `rank-bars` | Who leads this ranking, and by how much? | ranking | Not for time series, part-to-whole composition, or more than ~10 rows — use a table or sparklines instead. |
| `stacked-activity` | What makes up each day's volume, and how does it breathe day to day? | time-series | Comparing exact values of individual segments across days (inner segments have no common baseline) or fewer than 5 days. |
| `tug-of-war` | Who wins where, head to head? | ranking | Not for 3+ contenders, absolute magnitudes, or trends over time — the rope only shows the relative split per row. |
| `waffle-grid` | How big is this share of the whole, really? | composition | Not for comparing several shares, time trends, or non-percentage values — use rank bars or a distribution bar instead. |
| `warming-stripes` | When was this field hot, and when was it cold? | time-series | Short ranges or continuous quantitative series — use a line or bar chart when exact magnitudes matter. |
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
