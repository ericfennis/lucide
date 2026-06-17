---
name: add-icon
description: Add, validate, render, and screenshot Lucide icons. Use when asked to add a new icon, create an icon, preview or screenshot an icon, check how an icon renders, or validate icon SVG/metadata before a PR.
---

A Lucide icon is a pair of files in `icons/`: `<name>.svg` (the artwork) and
`<name>.json` (metadata — contributors, tags, categories, use-cases). There is
no "app" to launch; you drive icons through the driver at
[`.agents/skills/add-icon/driver.mjs`](.agents/skills/add-icon/driver.mjs),
which scaffolds an icon, validates it against the repo's checks, and
**rasterizes it to a PNG you can actually look at** (icons use
`stroke="currentColor"`, so they render invisible without help — the driver
injects a color). The screenshot is the point: a diff of SVG path data tells
you nothing about whether the icon looks right.

All paths below are relative to the **repo root** (`icons/` is at the root).
Verified on macOS (Darwin), Node 24.12, pnpm 11.6.

## Prerequisites

Node 18+ and pnpm (the repo ships `pnpm-lock.yaml`). No system packages —
`sharp` (used for rendering) ships prebuilt binaries for Linux and macOS.

```bash
corepack enable          # provides pnpm; or `npm i -g pnpm`
```

## Setup

```bash
pnpm install             # installs all 18 workspace projects, incl. docs/sharp
```

`sharp` is a dependency of `docs/`, not the root — the driver resolves it from
`docs/node_modules` automatically. If `docs/` deps aren't installed, rendering
fails (see Troubleshooting).

## Run (agent path)

The driver is the primary interface. Run it from the repo root:

```bash
# Preview any existing icon — renders to /tmp/lucide-shots/camera.png
node .agents/skills/add-icon/driver.mjs render camera
```

Then **open / Read the PNG** to inspect it. Full flow to add a new icon:

```bash
# 1. Scaffold the pair (lower-kebab-case name). Provide path data inline,
#    a full SVG file, or clone an existing icon as a starting point:
node .agents/skills/add-icon/driver.mjs new my-icon --path "M3 20 12 4 21 20 Z"
#   --svg <file>   use a full <svg> file
#   --from camera  clone icons/camera.svg as the starting artwork

# 2. Normalize the SVG to repo standards (svgo + canonical attrs, minified path):
node .agents/skills/add-icon/driver.mjs optimize my-icon

# 3. Edit icons/my-icon.json — add ≥1 contributor, ≥1 tag, valid categories.
#    (Set GITHUB_USERNAME before step 1 to prefill the contributor.)

# 4. Render it, and render it next to circle + square (the optical-volume check):
node .agents/skills/add-icon/driver.mjs render my-icon
node .agents/skills/add-icon/driver.mjs compare my-icon

# 5. Validate before committing:
node .agents/skills/add-icon/driver.mjs validate
```

Screenshots land in `/tmp/lucide-shots/` (override with `SHOTS_DIR=`, or
`--out <file>` per render).

| command | what it does |
|---|---|
| `render <name...>` | rasterize icon(s) to a PNG → `/tmp/lucide-shots/<name>.png`. Flags: `--out`, `--size N` (px, default 240), `--fg`, `--bg`. |
| `compare <name...>` | render the icon(s) next to `circle` and `square` for the optical-volume / centering check the design guide prescribes. |
| `new <name>` | scaffold `icons/<name>.svg` + `icons/<name>.json` (schema-complete template). Source: `--path "<d>"`, `--svg <file>`, or `--from <icon>`. |
| `optimize <name>` | normalize ONE icon via the repo's own `processSvg` (svgo + canonical attrs + prettier). Scoped — never touches other icons. |
| `validate` | run `pnpm checkIcons` (svg/json pairing + category refs) and `pnpm lint:json:icons` (ajv against `icon.schema.json`). |

## Human path

There is no GUI. The repo's own scripts (`pnpm gi <name>`, `pnpm optimize`,
`pnpm checkIcons`) do pieces of this — but see Gotchas: `pnpm gi` emits
schema-invalid JSON and `pnpm optimize` rewrites every icon. The full gallery
lives in the docs site (`cd docs && pnpm docs:dev`), useful for browsing but
overkill for adding one icon.

## Test

```bash
node .agents/skills/add-icon/driver.mjs validate   # the relevant check for icons
```

The repo-wide `pnpm test` runs every framework package's snapshot suite (slow,
and unrelated to a single icon add) — not needed to validate an icon.

## Gotchas

- **`pnpm gi <name>` and `pnpm addjsons` produce schema-invalid JSON.** Their
  templates omit `use-cases`, which `icon.schema.json` *requires* — so the icon
  fails `lint:json:icons` until you add it. The driver's `new` includes
  `"use-cases": []`, so it's already valid. (1736/1737 existing icons have
  `use-cases`.)
- **Never run `pnpm optimize` to tidy one icon.** It runs svgo over all 1700+
  icons and reorders attributes (e.g. `x y width` → `width … x y`),
  non-idempotently vs. the committed set — one run dirtied **287** unrelated
  icons in testing. Use the driver's `optimize <name>` instead, which processes
  only the named file through the exact same `processSvg`.
- **Icons render invisible by default.** `stroke="currentColor"` resolves to
  nothing outside a DOM with a color context. The driver swaps it for a real
  color (`--fg`, default near-black) before handing the SVG to sharp — don't
  feed the raw icon to an image tool and expect to see strokes.
- **Schema requirements that trip you up:** `tags` and `contributors` need ≥1
  entry; `use-cases` must be present (empty array is fine); every `categories`
  entry must be in the enum *and* have a matching file in `categories/`, or
  `checkIcons` fails.
- **Allowed SVG is narrow.** Only `path/line/polygon/polyline/circle/ellipse/rect`
  with geometry attributes — no `transform`, `fill`, explicit `stroke`, filters,
  or `<use>`. `optimize` strips stroke/fill, but it can't fix transforms.

## Troubleshooting

- **`Could not resolve sharp` (render/compare)**: `docs/` deps aren't installed.
  Run `pnpm install` at the repo root.
- **`must have required property 'use-cases'`** from `validate`: the JSON is
  missing `use-cases`. Add `"use-cases": []` (re-scaffolding with `new` avoids
  this).
- **`Icon 'x' refers to the non-existing category 'y'`** from `checkIcons`: `y`
  isn't a real category. Use a value from `icon.schema.json`'s category enum
  that also exists as `categories/y.json`.
- **`'<name>.svg' does not have a matching JSON file`**: you created the SVG but
  not the JSON. `new` always writes both; if hand-creating, add the `.json` too.
