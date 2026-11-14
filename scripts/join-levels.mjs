// Joins the four parts written by make-levels.mjs into levels-pool.js.
import fs from 'fs';
const all = [1, 26, 51, 76].flatMap(n => JSON.parse(fs.readFileSync(new URL(`../.levels-${n}.json`, import.meta.url), 'utf8')));
if (all.length !== 100) throw new Error('expected 100 levels, got ' + all.length);
fs.writeFileSync(new URL('../levels-pool.js', import.meta.url),
  '// All 100 generated levels. Not published. scripts/pick-levels.mjs chooses which ones ship in levels.js.\n// Made by scripts/make-levels.mjs. Do not edit by hand.\nconst POOL = ' + JSON.stringify(all).replace(/\},\{"s"/g, '},\n{"s"') + ';\n');
console.log('levels-pool.js: 100 levels');
