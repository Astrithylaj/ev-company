// Generates src/data/kosovo.json: outline path + dot grid inside Kosovo (Natural Earth 1:10m via world-atlas)
import { createRequire } from 'module';
import { feature } from 'topojson-client';
import { geoMercator, geoPath, geoContains } from 'd3-geo';
import { writeFileSync } from 'fs';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-10m.json');
const all = feature(topo, topo.objects.countries);
const ks = all.features.find(f => f.properties.name === 'Kosovo');
const W = 600, H = 640;
const proj = geoMercator().fitExtent([[20, 20], [W - 20, H - 20]], ks);
const path = geoPath(proj);
const step = 13;
const dots = [];
for (let y = 0; y < H; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < W; x += step) {
  const ll = proj.invert([x, y]);
  if (geoContains(ks, ll)) dots.push([Math.round(x * 10) / 10, y]);
}
const pr = proj([21.1655, 42.6629]).map(v => Math.round(v * 10) / 10);
writeFileSync('src/data/kosovo.json', JSON.stringify({ w: W, h: H, outline: path(ks), dots, prishtina: pr }));
console.log('dots', dots.length, 'prishtina', pr);
