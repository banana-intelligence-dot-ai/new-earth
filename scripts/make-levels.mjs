// Builds levels.js: 100 slingshot levels, each one checked by the solver before it is kept.
// Run: npm run levels   (four parts in parallel, then joined into levels.js)
// LEVEL1 below is the layout from the natepeace.com card, kept to prove the physics match it.
// The 100 levels are generated from the level number, so the file is the same every run. Difficulty is set by how small a share of all
// the widest winning window is, in degrees of aim: 5 at level 1 down to 1 at level 100.
// Every level has a world on the line from Earth to New Earth, so no straight shot wins: see straight().
import fs from 'fs';
import { fileURLToPath } from 'url';
const src = fs.readFileSync(new URL('../sim.js', import.meta.url), 'utf8');
const { W, H, ROCKET_R, fly, solve, bodyAt } = new Function(src + ';return{W,H,ROCKET_R,fly,solve,bodyAt}')();
const K = +(process.argv[2] || 14);

function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const r1 = v => Math.round(v * 10) / 10;

export const LEVEL1 = {
  s: { x: 54, y: 205 }, t: { x: 328, y: 38, r: 23 }, aim: [28.6, 125.3],
  b: [{ x: 30, y: 218, r: 22, mu: 22000, type: 'earth' }, { x: 100, y: 160, r: 10, mu: 10000, type: 'moon' },
    { x: 165, y: 88, r: 17, mu: 26000, type: 'planet' }, { x: 225, y: 168, r: 11, mu: 13000, type: 'moon' },
    { x: 270, y: 80, r: 20, mu: 34000, type: 'sun' }],
};

// What a level of this number is made of.
export function plan(n) {
  const f = (n - 1) / 99;
  return {
    bodies: n < 6 ? 1 : n < 11 ? 2 : n < 26 ? 2 + (n % 2) : n < 46 ? 3 : n < 66 ? 4 : n < 86 ? 3 + (n % 2) : 4,
    movers: n < 26 ? 0 : n < 46 ? 1 : n < 66 ? 1 + (n % 2) : n < 86 ? n % 2 : 1 + (n % 2),
    blocker: true,
    // things that do not pull but end the flight: asteroids from 16, a satellite from 36, the droid from 56
    obst: [n >= 16 && 'asteroid', n >= 36 && 'sat', n >= 56 && 'droid', n >= 90 && 'asteroid'].filter(Boolean),
    targetR: Math.round(22 - 11 * f),
    mu: 1 + 0.6 * f,
    width: 5 * Math.pow(1 / 5, f),   // widest winning window, in degrees: 5 at level 1, 1 at level 100
  };
}
// True if some shot wins with gravity switched off, which means a straight line reaches New Earth.
// Bodies stay solid and movers keep moving. Checks every power, and every half degree within 30 of the direct line.
export function straight(L) {
  const flat = { ...L, b: L.b.map(o => ({ ...o, mu: 0 })) };
  const dir = Math.round(Math.atan2(-(L.t.y - L.s.y), L.t.x - L.s.x) * 360 / Math.PI) / 2;
  for (let a = dir - 30; a <= dir + 30; a += 0.5) for (let p = 40; p <= 150; p += 2.5) if (fly(flat, a, p).r === 'win') return true;
  return false;
}
const KIND = { moon: [7, 10, 9000, 13000], planet: [12, 17, 22000, 36000], sun: [18, 22, 48000, 64000] };
function make(kind, x, y, R, scale) {
  const [ra, rb, ma, mb] = KIND[kind], u = R();
  return { x: r1(x), y: r1(y), r: Math.round(ra + (rb - ra) * u), mu: Math.round((ma + (mb - ma) * u) * scale / 100) * 100, type: kind };
}

function candidate(n, k) {
  const P = plan(n), R = rng(n * 7919 + k * 104729 + 17);
  const ey = 45 + R() * 175, earth = { x: r1(18 + R() * 16), y: r1(ey), r: 22, mu: 24000, type: 'earth' };
  const t = { x: r1(300 + R() * 34), y: r1(32 + R() * 186), r: P.targetR };
  const dx = t.x - earth.x, dy = t.y - earth.y, D = Math.hypot(dx, dy);
  const s = { x: r1(earth.x + dx / D * 27.5), y: r1(earth.y + dy / D * 27.5) };
  const b = [earth];
  // far enough from the start, the target and every other body (ring = a mover's whole path)
  const clear = (c, pad = 12) => {
    const far = (px, py, pr, gap) => { const d = Math.hypot(px - c.x, py - c.y); return (c.ring ? Math.abs(d - c.ring) : d) > c.r + pr + gap || (c.ring && d + pr + gap < c.ring - c.r); };
    if (!far(s.x, s.y, ROCKET_R, 34) || !far(t.x, t.y, t.r, 16) || !far(earth.x, earth.y, earth.r, 14)) return false;
    for (const o of b) { if (o === earth) continue;
      if (o.o) { const d = Math.hypot(o.o.cx - c.x, o.o.cy - c.y); if (c.ring ? d < c.ring + o.o.r + c.r + o.r + pad : Math.abs(d - o.o.r) < c.r + o.r + pad) return false; }
      else if (!far(o.x, o.y, o.r, pad)) return false; }
    return true;
  };
  if (P.blocker) {
    const u = 0.36 + R() * 0.28, kind = n === 100 ? 'hole' : R() < 0.5 ? 'sun' : 'planet';
    const c = kind === 'hole' ? { x: r1(s.x + dx * u), y: r1(s.y + dy * u), r: 9, mu: 100000, type: 'hole' } : make(kind, s.x + (t.x - s.x) * u, s.y + (t.y - s.y) * u, R, P.mu);
    if (kind !== 'hole') c.r = Math.max(c.r, 15);
    b.push(c);
  }
  let guard = 0;
  while (b.length < 1 + P.bodies && guard++ < 400) {
    const q = R(), kind = q < 0.45 ? 'moon' : q < 0.8 ? 'planet' : n > 8 ? 'sun' : 'planet';
    const c = make(kind, 78 + R() * 215, 22 + R() * 206, R, P.mu);
    if (clear(c)) b.push(c);
  }
  if (b.length < 1 + P.bodies) return null;
  // turn some bodies into movers: they circle a fixed point, starting when the rocket launches
  let made = 0; guard = 0;
  const pool = b.filter(o => o.type !== 'earth' && o.type !== 'hole' && !(P.blocker && o === b[1]));
  while (made < P.movers && guard++ < 200 && pool.length) {
    const o = pool[Math.floor(R() * pool.length)]; if (o.o) continue;
    const rad = 16 + R() * 26, p = R() * Math.PI * 2, w = (0.5 + R() * 0.9) * (R() < 0.5 ? -1 : 1);
    const cx = o.x - rad * Math.cos(p), cy = o.y - rad * Math.sin(p);
    if (cx - rad < 60 || cx + rad > 300 || cy - rad < 8 || cy + rad > H - 8) continue;
    const i = b.indexOf(o); b.splice(i, 1);
    const ok = clear({ x: cx, y: cy, r: o.r, ring: rad });
    b.splice(i, 0, o);
    if (!ok) continue;
    o.o = { cx: r1(cx), cy: r1(cy), r: r1(rad), p: r1(p * 100) / 100, w: Math.round(w * 100) / 100 };
    const at = bodyAt(o, 0); o.x = r1(at.x); o.y = r1(at.y); made++;
  }
  if (made < P.movers) return null;
  // obstacles: no pull, but hitting one ends the flight
  const px = -dy / D, py = dx / D, worlds = b.filter(o => o.type !== 'earth' && !o.o);
  for (const kind of P.obst) {
    let c = null;
    for (let tries = 0; tries < 80 && !c; tries++) {
      if (kind === 'asteroid') {
        const u = 0.2 + R() * 0.7, off = (15 + R() * 55) * (R() < 0.5 ? -1 : 1);
        const a = { x: r1(s.x + dx * u + px * off), y: r1(s.y + dy * u + py * off), r: 5 + Math.floor(R() * 3), mu: 0, type: 'asteroid' };
        if (a.x > 60 && a.x < W - 20 && a.y > 12 && a.y < H - 12 && clear(a, 8)) c = a;
      } else if (kind === 'sat') {
        const h = worlds[Math.floor(R() * worlds.length)], ring = h.r + 11 + R() * 8;
        const gap = (q, qr) => Math.hypot(q.x - h.x, q.y - h.y) - ring - qr;
        if (gap(s, 0) < 30 || gap(t, t.r) < 14 || gap(earth, earth.r) < 12) continue;
        if (b.some(o => o !== h && o !== earth && (o.o ? Math.hypot(o.o.cx - h.x, o.o.cy - h.y) - o.o.r - ring - o.r < 12 : gap(o, o.r) < 12))) continue;
        const p = R() * Math.PI * 2, w = (1.2 + R()) * (R() < 0.5 ? -1 : 1);
        c = { r: 5, mu: 0, type: 'sat', o: { cx: h.x, cy: h.y, r: r1(ring), p: Math.round(p * 100) / 100, w: Math.round(w * 100) / 100 } };
      } else {
        const u = 0.3 + R() * 0.5, off = (R() * 2 - 1) * 60, ring = 18 + R() * 16;
        const cx = s.x + dx * u + px * off, cy = s.y + dy * u + py * off;
        if (cx - ring < 60 || cx + ring > 300 || cy - ring < 10 || cy + ring > H - 10) continue;
        if (!clear({ x: cx, y: cy, r: 7, ring }, 10)) continue;
        const p = R() * Math.PI * 2, w = (0.6 + R() * 0.7) * (R() < 0.5 ? -1 : 1);
        c = { r: 7, mu: 0, type: 'droid', o: { cx: r1(cx), cy: r1(cy), r: r1(ring), p: Math.round(p * 100) / 100, w: Math.round(w * 100) / 100 } };
      }
    }
    if (!c) return null;
    if (c.o) { const at = bodyAt(c, 0); c.x = r1(at.x); c.y = r1(at.y); }
    b.push(c);
  }
  const aim = [r1(Math.atan2(-(t.y - s.y), t.x - s.x) * 180 / Math.PI), 100];
  return { s, t, b, aim };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
const from = +(process.argv[3] || 1), to = +(process.argv[4] || 100), out = [];
for (let n = from; n <= to; n++) {
  const P = plan(n); let best = null;
  for (let k = 0, kept = 0; kept < K && k < K * 40; k++) {
    const L = candidate(n, k); if (!L) continue;
    if (fly(L, L.aim[0], L.aim[1]).r === 'win') continue;      // the first, obvious shot must miss
    if (straight(L)) continue;                                 // and no straight line may reach New Earth
    const sv = solve(L); if (!sv.best) continue;
    kept++;
    const miss = Math.abs(Math.log(sv.width / P.width));
    if (!best || miss < best.miss) best = { L, sv, miss };
    if (miss < 0.12) break;
  }
  if (!best) { console.error('no level found for', n); process.exit(1); }
  out.push(best.L);
  console.log(n, 'window target', P.width.toFixed(1), 'got', best.sv.width.toFixed(1), 'share', (best.sv.share * 100).toFixed(2) + '%');
}
fs.writeFileSync(new URL(`../.levels-${from}.json`, import.meta.url), JSON.stringify(out));
}
