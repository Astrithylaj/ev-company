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
// main towns, shown as smaller lights so the map reads "all of Kosovo", not only Prishtina
const TOWNS = [
  ['Prizren', 20.7397, 42.2139], ['Pejë', 20.2887, 42.6593], ['Gjakovë', 20.4308, 42.3803], ['Mitrovicë', 20.866, 42.8914],
  ['Ferizaj', 21.1553, 42.3702], ['Gjilan', 21.4694, 42.4635], ['Podujevë', 21.1931, 42.9106], ['Vushtrri', 20.9675, 42.8231],
  ['Suharekë', 20.8253, 42.3586], ['Skenderaj', 20.7889, 42.7467], ['Kamenicë', 21.5803, 42.5781], ['Dragash', 20.6531, 42.0626],
  ['Istog', 20.4875, 42.7808], ['Malishevë', 20.7458, 42.4822], ['Deçan', 20.2879, 42.5402], ['Viti', 21.3583, 42.3214],
];
const towns = TOWNS.map(([name, lon, lat]) => [name, ...proj([lon, lat]).map(v => Math.round(v * 10) / 10)]);
writeFileSync('src/data/kosovo.json', JSON.stringify({ w: W, h: H, outline: path(ks), dots, prishtina: pr, towns }));
console.log('dots', dots.length, 'prishtina', pr);
