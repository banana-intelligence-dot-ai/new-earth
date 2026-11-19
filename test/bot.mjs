// Robot pilot: proves a course can be flown start to finish, and sets "the robot's time".
// Run: node test/bot.mjs [seed] [cruise] [horizon] [hold]   (exit 0 = reached New Earth)
import fs from 'fs';
import { fileURLToPath } from 'url';
const html = fs.readFileSync(new URL('../classic/index.html', import.meta.url), 'utf8');
const sim = html.split('/*SIM-START*/')[1].split('/*SIM-END*/')[0];
const { makeLevel, newState, step, placeAt, spawnFor, wrapA } =
  new Function(sim + ';return{makeLevel,newState,step,placeAt,spawnFor,wrapA}')();

const DT = 1 / 60;
// The published robot: these settings are what "the robot did" means on the site.
export const ROBOT = { cruise: 300, horizon: 3.2, hold: 0.15 };

const clone = S => ({ ...S, probe: S.probe ? { ...S.probe } : null });
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

// Flies one course. Returns { win, time, deaths, body }.
export function fly(seed, { cruise, horizon, hold } = ROBOT) {
  const L = makeLevel(seed);
  const rollout = (S0, c) => {
    const S = clone(S0);
    for (let t = 0; t < horizon; t += DT) {
      const ev = step(L, S, inputFor(c, S, t), DT);
      if (ev === 'win') return 1e7 - t;
      if (ev === 'crash') return -1e6 + t * 1000;
    }
    return S.y + 0.6 * S.vy - Math.max(0, Math.hypot(S.vx, S.vy) - cruise) * 25;
  };
  const S = newState();
  let lives = 3; const deaths = [];
  step(L, S, { thrust: true }, DT);
  while (S.t < 900) {
    let best = cands[0], bs = -Infinity;
    for (const c of cands) { const s = rollout(S, c); if (s > bs) { bs = s; best = c; } }
    let ev = null;
    for (let t = 0; t < hold && !ev; t += DT) ev = step(L, S, inputFor(best, S, t), DT);
    if (ev === 'win') return { win: true, time: S.t, deaths, body: 100, bodies: L.numbered.length };
    if (ev === 'crash') {
      deaths.push(S.passed);
      if (--lives <= 0) return { win: false, time: S.t, deaths, body: S.passed };
      placeAt(L, S, spawnFor(L, S.y));
    }
  }
  return { win: false, time: S.t, deaths, body: S.passed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [seed = 11, cruise = ROBOT.cruise, horizon = ROBOT.horizon, hold = ROBOT.hold] = process.argv.slice(2).map(Number);
  const r = fly(seed, { cruise, horizon, hold });
  console.log(`${r.win ? 'WIN' : 'FAILED at body ' + r.body}  seed ${seed}  time ${r.time.toFixed(1)}s  ships lost at bodies [${r.deaths}]`);
  process.exit(r.win ? 0 : 1);
}
