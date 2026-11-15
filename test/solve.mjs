// Proves every level can be won. For each of the 100 levels the solver flies every shot on a grid
// (angle by half a degree, power by 2.5) and must find a safe shot: one that wins, and still wins
// half a degree either side and one power point either side. Exit 0 = all 100 winnable.
// No level may have a straight shot: with gravity switched off, nothing on the grid reaches New Earth.
// Also checks the physics against the natepeace.com card: its default aim misses, (90, -32) wins.
// Run: node test/solve.mjs
import fs from 'fs';
import { LEVEL1 as CARD, plan, straight } from '../scripts/make-levels.mjs';
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const { fly, solve, LEVELS, PMIN, PMAX } = new Function(read('sim.js') + read('levels.js') + ';return{fly,solve,LEVELS,PMIN,PMAX}')();

let bad = 0;
const fail = m => { bad++; console.log('FAIL', m); };
const shot = (vx, vy) => fly(CARD, Math.atan2(-vy, vx) * 180 / Math.PI, Math.hypot(vx, vy)).r;
if (shot(110, -60) === 'win') fail('card: default aim (110, -60) should miss');
if (shot(90, -32) !== 'win') fail('card: (90, -32) should win');
if (LEVELS.length !== 100) fail('expected 100 levels, got ' + LEVELS.length);

const width = [];
LEVELS.forEach((L, i) => {
  const n = i + 1, P = plan(n), sv = solve(L);
  width.push(sv.width);
  if (!sv.best) return fail(`level ${n}: no safe winning shot`);
  if (fly(L, sv.best.ang, sv.best.pow).r !== 'win') fail(`level ${n}: safe shot did not win on replay`);
  if (fly(L, L.aim[0], L.aim[1]).r === 'win') fail(`level ${n}: the starting aim already wins`);
  if (straight(L)) fail(`level ${n}: a straight shot wins with gravity off`);
  if (L.aim[1] < PMIN || L.aim[1] > PMAX) fail(`level ${n}: starting power out of range`);
  if (L.t.r !== P.targetR) fail(`level ${n}: target size ${L.t.r}, plan says ${P.targetR}`);
  if (L.b.filter(b => b.o).length !== P.movers) fail(`level ${n}: wrong number of moving bodies`);
  if (n % 10 === 0 || n === 1) console.log(`level ${String(n).padStart(3)}: ${L.b.length - 1} bodies, ${P.movers} moving, target ${L.t.r}, window ${sv.width.toFixed(1)} deg, safe shot ${sv.best.ang} deg at power ${sv.best.pow}`);
});
// Rising difficulty: the widest winning window shrinks from each block of 20 levels to the next.
const avg = k => width.slice(k * 20, k * 20 + 20).reduce((a, b) => a + b, 0) / 20;
const blocks = [0, 1, 2, 3, 4].map(avg);
console.log('average window by block of 20 levels (degrees):', blocks.map(v => v.toFixed(2)).join(' > '));
for (let k = 1; k < 5; k++) if (!(blocks[k] < blocks[k - 1])) fail(`levels ${k * 20 + 1}-${k * 20 + 20} are not harder than the 20 before`);
console.log(bad ? `${bad} FAILED` : `PASS: ${LEVELS.length} of ${LEVELS.length} levels have a safe winning shot`);
process.exit(bad ? 1 : 0);
