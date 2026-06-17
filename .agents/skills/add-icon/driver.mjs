#!/usr/bin/env node
/**
 * add-icon driver — scaffold, validate, and render Lucide icons so a change
 * can be SEEN, not just diffed.
 *
 * Commands:
 *   new <name> [--path "<d>"] [--svg <file>] [--from <icon>]
 *                         scaffold icons/<name>.svg + icons/<name>.json
 *   render <name...> [--out <file>] [--size N] [--fg <color>] [--bg <color>]
 *                         rasterize icon(s) to a PNG you can open (the screenshot)
 *   compare <name> [...]  render <name> next to `circle` and `square`
 *                         (the design-guide optical-volume check)
 *   validate              run the repo validators (checkIcons + ajv schema)
 *   optimize <name>       normalize ONE icon to repo standards (svgo + canonical attrs)
 *
 * Run from the repo root. Rendering uses `sharp`, resolved from docs/node_modules.
 * Screenshots default to /tmp/lucide-shots/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// .agents/skills/add-icon -> repo root
const ROOT = path.resolve(HERE, '../../..');
const ICONS_DIR = path.join(ROOT, 'icons');
const SHOTS = process.env.SHOTS_DIR || '/tmp/lucide-shots';

const SVG_TEMPLATE = (body = '') => `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
${body}
</svg>
`;

const JSON_TEMPLATE = (contributor) =>
  JSON.stringify(
    {
      $schema: '../icon.schema.json',
      contributors: contributor ? [contributor] : [],
      'use-cases': [],
      tags: [],
      categories: [],
    },
    null,
    2,
  ) + '\n';

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function resolveSharp() {
  // sharp is a devDependency of docs; resolve it from there.
  for (const base of ['docs/package.json', 'package.json']) {
    try {
      const req = createRequire(path.join(ROOT, base));
      return req('sharp');
    } catch {
      /* try next */
    }
  }
  die('Could not resolve `sharp`. Run `pnpm install` in docs/ first.');
}

// Parse `--flag value` pairs and positional args.
function parseArgs(argv) {
  const flags = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      flags[argv[i].slice(2)] = argv[i + 1];
      i++;
    } else {
      pos.push(argv[i]);
    }
  }
  return { flags, pos };
}

function cmdNew(argv) {
  const { flags, pos } = parseArgs(argv);
  const name = pos[0];
  if (!name) die('usage: new <name> [--path "<d>"] [--svg <file>] [--from <icon>]');
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name))
    die(`"${name}" is not lower-kebab-case (e.g. arrow-up, circle-dashed).`);

  const svgPath = path.join(ICONS_DIR, `${name}.svg`);
  const jsonPath = path.join(ICONS_DIR, `${name}.json`);
  if (fs.existsSync(svgPath)) die(`icons/${name}.svg already exists.`);

  let svg;
  if (flags.svg) {
    svg = fs.readFileSync(path.resolve(flags.svg), 'utf-8');
  } else if (flags.from) {
    svg = fs.readFileSync(path.join(ICONS_DIR, `${flags.from}.svg`), 'utf-8');
  } else if (flags.path) {
    svg = SVG_TEMPLATE(`  <path d="${flags.path}" />`);
  } else {
    svg = SVG_TEMPLATE('  <!-- add path/shape elements here -->');
  }

  fs.writeFileSync(svgPath, svg);
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON_TEMPLATE(process.env.GITHUB_USERNAME));
  }
  console.log(`✓ wrote icons/${name}.svg`);
  console.log(`✓ wrote icons/${name}.json  (fill in contributors, tags ≥1, categories)`);
  console.log(`Next: edit the JSON, then \`node .agents/skills/add-icon/driver.mjs render ${name}\``);
}

async function renderToPng(sharp, names, { size, fg, bg, out }) {
  const cell = size;
  const pad = Math.round(cell * 0.15);
  const label = 22;
  const cols = names.length;
  const W = cols * cell + (cols + 1) * pad;
  const H = cell + 2 * pad + label;

  let tiles = '';
  names.forEach((name, i) => {
    const file = path.join(ICONS_DIR, `${name}.svg`);
    if (!fs.existsSync(file)) die(`icons/${name}.svg does not exist.`);
    let icon = fs.readFileSync(file, 'utf-8');
    // strip the xml svg wrapper into an inline <g> so we can place + recolor it
    const inner = icon.replace(/<\?xml[^>]*\?>/, '').match(/<svg[^>]*>([\s\S]*)<\/svg>/i)[1];
    const x = pad + i * (cell + pad);
    tiles += `<g transform="translate(${x},${pad}) scale(${cell / 24})"
      fill="none" stroke="${fg}" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">${inner}</g>
      <text x="${x + cell / 2}" y="${pad + cell + 16}" font-family="sans-serif"
        font-size="12" fill="${fg}" text-anchor="middle">${name}</text>`;
  });

  const composed = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="${bg}"/>${tiles}</svg>`;

  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(composed)).png().toFile(out);
  console.log(`✓ rendered ${names.join(', ')} → ${out}`);
  console.log(`  open it / Read the file to inspect the icon visually.`);
}

async function cmdRender(argv, { withRefs = false } = {}) {
  const { flags, pos } = parseArgs(argv);
  if (!pos.length) die('usage: render <name...> [--out <file>] [--size N] [--fg c] [--bg c]');
  const names = withRefs ? [...pos, 'circle', 'square'] : pos;
  const sharp = resolveSharp();
  const out = flags.out
    ? path.resolve(flags.out)
    : path.join(SHOTS, `${withRefs ? 'compare-' : ''}${pos[0]}.png`);
  await renderToPng(sharp, names, {
    size: Number(flags.size) || 240,
    fg: flags.fg || '#1f1f1f',
    bg: flags.bg || '#ffffff',
    out,
  });
}

function run(cmd, args) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: false });
  return r.status ?? 1;
}

async function cmdOptimize(argv) {
  const { pos } = parseArgs(argv);
  const name = pos[0];
  if (!name)
    die('usage: optimize <name>  (scoped to one icon — never run `pnpm optimize`, it rewrites all 1700+)');
  const file = path.join(ICONS_DIR, `${name}.svg`);
  if (!fs.existsSync(file)) die(`icons/${name}.svg does not exist.`);
  // Reuse the repo's own SVG processor (svgo + canonical attrs + prettier).
  const { default: processSvg } = await import(
    pathToFileURL(path.join(ROOT, 'scripts/render/processSvg.mts')).href
  );
  const optimized = await processSvg(fs.readFileSync(file, 'utf-8'), `${name}.svg`);
  fs.writeFileSync(file, optimized);
  console.log(`✓ optimized icons/${name}.svg (canonical attrs + minified, repo standard)`);
}

function cmdValidate() {
  let bad = 0;
  bad += run('pnpm', ['checkIcons']) ? 1 : 0;
  bad += run('pnpm', ['lint:json:icons']) ? 1 : 0;
  if (bad) die('validation failed (see output above).');
  console.log('✓ checkIcons + schema validation passed.');
}

const [, , command, ...rest] = process.argv;
switch (command) {
  case 'new':
    cmdNew(rest);
    break;
  case 'render':
    await cmdRender(rest);
    break;
  case 'compare':
    await cmdRender(rest, { withRefs: true });
    break;
  case 'validate':
    cmdValidate();
    break;
  case 'optimize':
    await cmdOptimize(rest);
    break;
  default:
    console.log(
      `add-icon driver — commands: new | render | compare | validate | optimize\n` +
        `  node .agents/skills/add-icon/driver.mjs render camera\n` +
        `  node .agents/skills/add-icon/driver.mjs new my-icon --path "M3 3 21 21"\n` +
        `  node .agents/skills/add-icon/driver.mjs compare my-icon`,
    );
    if (command) die(`unknown command: ${command}`);
}
