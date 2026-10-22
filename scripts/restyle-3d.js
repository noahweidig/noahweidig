// Re-skins the github-profile-3d-contrib "green" output with the noahweidig.com palette.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../profile-3d-contrib');
const SRC = path.join(DIR, 'profile-green.svg');
const OUT = path.join(DIR, 'profile-site.svg');

const light = {
  ink: '#37352f', dim: '#5f5e5a', line: '#e9e9e7', strong: '#d3d2ce', base: '#f7f7f7',
  accent: '#0072e3', 'accent-ink': '#0a54ba', moss: '#0f6220', violet: '#7237ae',
  yellow: '#7a5000', red: '#b8142d', teal: '#126764',
};
const dark = {
  ink: '#ececec', dim: '#a3a3a3', line: '#2a2a2a', strong: '#3a3a3a', base: '#131313',
  accent: '#0072e3', 'accent-ink': '#6ba4ff', moss: '#68ce7e', violet: '#c28df6',
  yellow: '#ffc95e', red: '#ff6b78', teal: '#5fc7c2',
};
const vars = (p) => Object.entries(p).map(([k, v]) => `--${k}:${v}`).join(';');

const pct = [0, 26, 48, 74, 100];
const cells = [0, 1, 2, 3, 4].map((n) => {
  const top = n === 0
    ? 'var(--line)'
    : `color-mix(in srgb,var(--accent) ${pct[n]}%,var(--base))`;
  return `.cont-top-${n}{fill:${top}}`
    + `.cont-left-${n}{fill:color-mix(in srgb,${top} 82%,#000)}`
    + `.cont-right-${n}{fill:color-mix(in srgb,${top} 66%,#000)}`;
}).join('\n');

const style = `<style>:root{${vars(light)}}
@media(prefers-color-scheme:dark){:root{${vars(dark)}}}
*{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.fill-fg{fill:var(--ink)}.stroke-fg{stroke:var(--ink)}
.fill-bg{fill:var(--base)}.stroke-bg{stroke:var(--base)}
.fill-strong{fill:var(--accent-ink)}.fill-weak{fill:var(--dim)}.stroke-weak{stroke:var(--strong)}
.axis{stroke:var(--strong)}
.radar{stroke-width:3px;stroke:var(--accent-ink);fill:var(--accent-ink);fill-opacity:.18}
${cells}</style>`;

const slices = [100, 80, 62, 46, 34, 24, 18].map((n) => `color-mix(in srgb,var(--accent-ink) ${n}%,var(--base))`);
let i = 0;
let j = 0;
const svg = fs.readFileSync(SRC, 'utf-8')
  .replace(/<style>[\s\S]*?<\/style>/, style)
  .replace(/<rect[^>]*class="fill-bg"[^>]*>(<\/rect>)?/g, '')
  .replace(/style="fill: #[0-9a-fA-F]{3,8};" class="stroke-bg"/g,
    () => `style="fill:${slices[i++ % slices.length]}" class="stroke-bg"`)
  .replace(/fill="#[0-9a-fA-F]{3,8}" class="stroke-bg"/g,
    () => `rx="3" style="fill:${slices[j++ % slices.length]}" class="stroke-bg"`);

fs.writeFileSync(OUT, svg);
console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${i} slices recolored)`);
