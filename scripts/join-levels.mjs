// Joins the four parts written by make-levels.mjs into levels.js.
import fs from 'fs';
const all = [1, 26, 51, 76].flatMap(n => JSON.parse(fs.readFileSync(new URL(`../.levels-${n}.json`, import.meta.url), 'utf8')));
if (all.length !== 100) throw new Error('expected 100 levels, got ' + all.length);
fs.writeFileSync(new URL('../levels.js', import.meta.url),
  '// Made by scripts/make-levels.mjs. Do not edit by hand.\nconst LEVELS = ' + JSON.stringify(all).replace(/\},\{"s"/g, '},\n{"s"') + ';\n');
console.log('levels.js: 100 levels');
