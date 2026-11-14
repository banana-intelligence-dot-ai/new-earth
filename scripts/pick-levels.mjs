// Chooses which levels ship. Writes levels.js from the pool of 100 in levels-pool.js.
// To add levels later: add rows to PICKS (pool number, optional note shown when the level opens),
// keep them in order of difficulty, then run: npm run pick && npm test
// The game reads the count from levels.js, so no game code changes. Only the head tags, llms.txt
// and the share image name the count in words.
import fs from 'fs';
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const POOL = new Function(read('levels-pool.js') + ';return POOL')();
const PICKS = [
  [1, 'Leave old Earth. Reach New Earth. One launch each level. Pull the rocket back and let go.'],
  [9, 'Two worlds now. Each one pulls. Miss, then change the angle a little.'],
  [18, 'A sun. It pulls hardest.'],
  [25, 'More worlds, more pull.'],
  [30, 'One planet moves now. It starts when you launch.'],
  [39, 'Smaller target. Watch the moving one.'],
  [50, 'Four worlds in the way.'],
  [72, 'No straight shot from here. Swing around.'],
  [99, 'Everything at once.'],
  [100, 'A black hole sits in the way. Last one.'],
];
const out = PICKS.map(([n, note]) => ({ ...POOL[n - 1], ...(note ? { note } : {}) }));
fs.writeFileSync(new URL('../levels.js', import.meta.url),
  '// The levels that ship, in play order. Made by scripts/pick-levels.mjs from levels-pool.js.\nconst LEVELS = ' + JSON.stringify(out).replace(/\},\{"s"/g, '},\n{"s"') + ';\n');
console.log('levels.js:', out.length, 'levels, from pool numbers', PICKS.map(p => p[0]).join(', '));
