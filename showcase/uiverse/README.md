# uiverse.io showcase

[uiverse.io](https://uiverse.io) takes HTML + CSS only (no JavaScript, no
headings), so vizcn forms travel there as static SVG cards. Not a registry
mirror — a hand-made derivative that links back to the shelf.

- `dune-card.html` / `dune-card.css` — the `dune-flow` hero as a card:
  static B-spline layers over real commits-per-day data of vibecoding.ru
  (Jul 1 – Sep 19 2026), hover redraws the dunes left to right, a live dot
  with a label lands on today, a grey ghost echoes the future.
  Published: https://uiverse.io/eugeneshilow/green-bear-100
- `build-dune-card-paths.mjs` — recomputes the SVG paths from a
  `{ days, series }` JSON (same basis-spline math as `registry/dune-flow`);
  paste the output into the HTML by hand.
