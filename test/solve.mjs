// Proves every shipped level can be won. For each level in levels.js the solver flies every shot on
// a grid (angle by half a degree, power by 2.5) and must find a safe shot: one that wins, and still
// wins half a degree either side and one power point either side. Exit 0 = every level winnable.
// Also checks the levels get harder (the easiest winning window never widens from one level to the
// next) and checks the physics against the natepeace.com card: default aim misses, (90, -32) wins.
// Run: node test/solve.mjs        (the levels that ship)
//      node test/solve.mjs pool   (all 100 generated levels, winnable check only)
import fs from 'fs';
import { LEVEL1 as CARD } from '../scripts/make-levels.mjs';
const pool = process.argv[2] === 'pool';
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const { fly, solve, LEVELS, PMIN, PMAX } = new Function(read('sim.js') + read(pool ? 'levels-pool.js' : 'levels.js') + `;return{fly,solve,LEVELS:${pool ? 'POOL' : 'LEVELS'},PMIN,PMAX}`)();

let bad = 0;
const fail = m => { bad++; console.log('FAIL', m); };
const shot = (vx, vy) => fly(CARD, Math.atan2(-vy, vx) * 180 / Math.PI, Math.hypot(vx, vy)).r;
if (shot(110, -60) === 'win') fail('card: default aim (110, -60) should miss');
if (shot(90, -32) !== 'win') fail('card: (90, -32) should win');
if (!LEVELS.length) fail('no levels');

const width = [];
LEVELS.forEach((L, i) => {
  const n = i + 1, sv = solve(L);
  width.push(sv.width);
  if (!sv.best) return fail(`level ${n}: no safe winning shot`);
  if (fly(L, sv.best.ang, sv.best.pow).r !== 'win') fail(`level ${n}: safe shot did not win on replay`);
  if (fly(L, L.aim[0], L.aim[1]).r === 'win') fail(`level ${n}: the starting aim already wins`);
  if (L.aim[1] < PMIN || L.aim[1] > PMAX) fail(`level ${n}: starting power out of range`);
  if (!pool && i && sv.width > width[i - 1]) fail(`level ${n}: easier than level ${n - 1} (window ${sv.width} > ${width[i - 1]} degrees)`);
  if (!pool || n % 10 === 0) console.log(`level ${String(n).padStart(3)}: ${L.b.length - 1} bodies, ${L.b.filter(b => b.o).length} moving${L.b.some(b => b.type === 'hole') ? ', black hole' : ''}, target ${L.t.r}, window ${sv.width.toFixed(1)} deg, safe shot ${sv.best.ang} deg at power ${sv.best.pow}`);
});
if (!pool && !(width[width.length - 1] < width[0])) fail('the last level is not harder than the first');
console.log(bad ? `${bad} FAILED` : `PASS: ${LEVELS.length} of ${LEVELS.length} levels have a safe winning shot`);
process.exit(bad ? 1 : 0);
