// Regenerates icons/*.svg in the noahweidig.com style: blue accent only,
// 1px outlines, mono-caps labels, Lucide glyphs (scripts/lucide-icons.json, ISC).
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '../icons');
const L = require('./lucide-icons.json');

const SANS = "Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const STYLE = `<style>:root{--ink:#37352f;--dim:#5f5e5a;--faint:#6b6a65;--line:#d3d2ce;--accent:#0072e3;--accent-ink:#0a54ba;--logo:#2383e2}`
  + `@media(prefers-color-scheme:dark){:root{--ink:#ececec;--dim:#a3a3a3;--faint:#8f8f8f;--line:#3a3a3a;--accent-ink:#6ba4ff;--logo:#5aa0ff}}`
  + `.s{font-family:${SANS}}.m{font-family:${MONO}}</style>`;

const f = (n) => +n.toFixed(2);

function svg(w, h, label, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f(w)}" height="${h}" viewBox="0 0 ${f(w)} ${h}" role="img" aria-label="${label}"><title>${label}</title>${STYLE}${body}</svg>\n`;
}

/** Lucide glyph at (x,y), `size` px, stroke `sw` px wide on screen. */
function glyph(name, x, y, size, color, sw = 1.75) {
  const k = size / 24;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})" fill="none" stroke="${color}" stroke-width="${f(sw / k)}" stroke-linecap="round" stroke-linejoin="round">${L[name]}</g>`;
}

const ring = (d) => `<circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - 0.5}" fill="none" stroke="var(--accent)" stroke-opacity=".5"/>`;

function write(file, content) {
  fs.writeFileSync(path.join(OUT, file), content);
}

// Heading tiles: outlined circle, blue glyph.
const headings = {
  user: 'h-user', microscope: 'h-microscope', flame: 'h-flame', map: 'h-map',
  wrench: 'h-wrench', 'chart-column': 'h-chart', handshake: 'h-handshake',
};
for (const [icon, file] of Object.entries(headings)) {
  write(`${file}.svg`, svg(28, 28, '', ring(28) + glyph(icon, 7, 7, 14, 'var(--accent-ink)', 1.5)));
}

// Social tiles.
const socials = {
  't-email': ['mail', 'Email'], 't-substack': ['newspaper', 'Substack'],
  't-linkedin': ['linkedin', 'LinkedIn'], 't-orcid': ['fingerprint', 'ORCID'],
  't-scholar': ['graduation-cap', 'Google Scholar'], 't-github': ['github', 'GitHub'],
};
for (const [file, [icon, label]] of Object.entries(socials)) {
  write(`${file}.svg`, svg(44, 44, label, ring(44) + glyph(icon, 12, 12, 20, 'var(--accent-ink)', 1.6)));
}

// Buttons: primary is solid blue, the rest are outlined neutral pills.
const buttons = [
  ['btn-meet', 'Meet with me', 'calendar', 90.47, true],
  ['btn-coffee', 'Buy me a coffee', 'coffee', 107.7, false],
  ['btn-site', 'Case studies, maps, publications', 'globe', 221.33, false],
];
for (const [file, label, icon, tw, primary] of buttons) {
  const w = 18 + 16 + 8 + tw + 20;
  const fg = primary ? '#fff' : 'var(--ink)';
  const pill = primary
    ? `<rect width="${f(w)}" height="40" rx="20" fill="var(--accent)"/>`
    : `<rect x=".5" y=".5" width="${f(w - 1)}" height="39" rx="19.5" fill="none" stroke="var(--line)"/>`;
  write(`${file}.svg`, svg(w, 40, label,
    pill + glyph(icon, 18, 12, 16, fg, 1.75)
    + `<text class="s" x="42" y="25" font-size="14" font-weight="600" letter-spacing="-.07" fill="${fg}">${label}</text>`));
}

// Wordmark: blue Lucide box + two-tone name, no pill.
write('logo.svg', svg(158, 44, 'noahweidig.com',
  glyph('box', 1, 6.5, 31, 'var(--logo)', 2.2 * 31 / 24)
  + `<text class="s" x="40" y="29" font-size="20" font-weight="600" letter-spacing="-.7" fill="var(--ink)">Noah</text>`
  + `<text class="s" x="${f(40 + 48.49 + 5.6)}" y="29" font-size="20" font-weight="500" letter-spacing="-.7" fill="var(--faint)">Weidig</text>`));

// Tech chips: outlined mono-caps tag with a Lucide category glyph.
const chips = {
  'c-r': ['R', 'code-xml'], 'c-python': ['Python', 'code-xml'], 'c-javascript': ['JavaScript', 'code-xml'],
  'c-bash': ['Bash', 'code-xml'], 'c-html5': ['HTML5', 'code-xml'], 'c-css': ['CSS', 'code-xml'],
  'c-latex': ['LaTeX', 'code-xml'], 'c-markdown': ['Markdown', 'code-xml'],
  'c-earth-engine': ['Earth Engine', 'globe'], 'c-arcgis': ['ArcGIS', 'globe'], 'c-gdal': ['GDAL', 'globe'],
  'c-openstreetmap': ['OpenStreetMap', 'globe'], 'c-mapbox': ['Mapbox', 'globe'],
  'c-maplibre': ['MapLibre', 'globe'], 'c-leaflet': ['Leaflet', 'globe'],
  'c-rstudio': ['RStudio', 'database'], 'c-tidyverse': ['Tidyverse', 'database'],
  'c-geopandas': ['GeoPandas', 'database'], 'c-numpy': ['NumPy', 'database'],
  'c-jupyter': ['Jupyter', 'database'], 'c-quarto': ['Quarto', 'database'],
  'c-github-actions': ['GitHub Actions', 'database'], 'c-git': ['Git', 'database'],
};
const CH = 7.26;
for (const [file, [label, icon]] of Object.entries(chips)) {
  const tw = label.length * CH;
  const w = 10 + 12 + 6 + tw + 10;
  write(`${file}.svg`, svg(w, 28, label,
    `<rect x=".5" y=".5" width="${f(w - 1)}" height="27" rx="4" fill="none" stroke="var(--line)"/>`
    + glyph(icon, 10, 8, 12, 'var(--accent-ink)', 1.5)
    + `<text class="m" x="28" y="18" font-size="11" font-weight="500" letter-spacing=".66" fill="var(--dim)" textLength="${f(tw)}" lengthAdjust="spacing">${label.toUpperCase()}</text>`));
}

// Hero: static two-line headline, blue gradient on one word.
const W = 900, H = 330, cx = W / 2;
const line2 = { w: 459.33, pre: 165.57, word: 271.81 };
const x0 = cx - line2.w / 2;
const gx1 = x0 + line2.pre, gx2 = gx1 + line2.word;
write('hero.svg', svg(W, H, 'Spatial analysis. Real insights.',
  `<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${f(gx1)}" y1="0" x2="${f(gx2)}" y2="40">`
  + `<stop offset="0" stop-color="var(--accent-ink)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--accent-ink) 70%,var(--ink))"/></linearGradient></defs>`
  + `<text class="s" x="${cx}" y="120" text-anchor="middle" font-size="76" font-weight="600" letter-spacing="-2.28" fill="var(--ink)">Spatial analysis.</text>`
  + `<text class="s" x="${cx}" y="206" text-anchor="middle" font-size="76" font-weight="600" letter-spacing="-2.28" fill="var(--ink)">Real <tspan fill="url(#g)">insights</tspan>.</text>`
  + `<text class="s" x="${cx}" y="268" text-anchor="middle" font-size="17" fill="var(--dim)">I turn satellite imagery, fire perimeters, and messy field data into models people can</text>`
  + `<text class="s" x="${cx}" y="294" text-anchor="middle" font-size="17" fill="var(--dim)">actually decide something with, mostly around wildfire risk in the wildland-urban interface.</text>`));

console.log('Wrote icons to', path.relative(process.cwd(), OUT));
