// Robot pilot: proves the course can be flown start to finish.
// Run: node test/bot.mjs   (exit 0 = reached New Earth)
import fs from 'fs';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sim = html.split('/*SIM-START*/')[1].split('/*SIM-END*/')[0];
const { makeLevel, newState, step, placeAt, spawnFor, wrapA } =
  new Function(sim + ';return{makeLevel,newState,step,placeAt,spawnFor,wrapA}')();

const L = makeLevel();
const DT = 1 / 60, HORIZON = +(process.argv[3] || 3.2), HOLD = +(process.argv[4] || 0.15);
const VCRUISE = +(process.argv[2] || 300);
const clone = S => ({ ...S, droid: S.droid ? { ...S.droid } : null });

const cands = [{ coast: true }, { brakeNow: true }];
for (let i = 0; i < 16; i++) for (const T1 of [0.3, 0.8]) for (const brake of [false, true])
  cands.push({ aim: (i / 16) * 2 * Math.PI - Math.PI, T1, brake });

function inputFor(c, S, t) {
  if (c.coast) return { thrust: false };
  if (c.brakeNow) return t < 0.6 ? { brake: true } : {};
  if (t < c.T1) return { aim: c.aim, thrust: Math.abs(wrapA(c.aim - S.a)) < 0.35 };
  if (c.brake && t < c.T1 + 0.7) return { brake: true };
  return {};
}
function rollout(S0, c) {
  const S = clone(S0);
  for (let t = 0; t < HORIZON; t += DT) {
    const ev = step(L, S, inputFor(c, S, t), DT);
    if (ev === 'win') return 1e7 - t;
    if (ev === 'crash') return -1e6 + t * 1000;
  }
  const sp = Math.hypot(S.vx, S.vy);
  return S.y + 0.6 * S.vy - Math.max(0, sp - VCRUISE) * 25;
}

const S = newState();
let lives = 3, deaths = [];
step(L, S, { thrust: true }, DT);
for (let iter = 0; iter < 200000; iter++) {
  let best = cands[0], bs = -Infinity;
  for (const c of cands) { const s = rollout(S, c); if (s > bs) { bs = s; best = c; } }
  let ev = null;
  for (let t = 0; t < HOLD && !ev; t += DT) ev = step(L, S, inputFor(best, S, t), DT);
  if (ev === 'win') {
    console.log(`WIN  time ${S.t.toFixed(1)}s  lives left ${lives}  deaths at bodies [${deaths}]`);
    process.exit(lives === 3 ? 0 : 0);
  }
  if (ev === 'crash') {
    deaths.push(S.passed); lives--;
    if (lives <= 0) { console.log(`OUT OF SHIPS at body ${S.passed}, t=${S.t.toFixed(1)}s, deaths [${deaths}]`); process.exit(1); }
    placeAt(L, S, spawnFor(L, S.y)); if (process.argv[5]) lives = 3;
  }
  if (S.t > 1500) { console.log(`TIMEOUT at body ${S.passed}`); process.exit(1); }
}
