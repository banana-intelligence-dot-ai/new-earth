// New Earth slingshot physics. Shared by the page, the level maker and the solver test.
// Field is 360 x 250 units. One launch, no steering: gravity does the rest.
const W = 360, H = 250, STEP = 1 / 120, ROCKET_R = 4, MAX_STEPS = 1500, OUT = 30, GRACE = 20;
const PMIN = 40, PMAX = 150, RAD = Math.PI / 180;

// Where a body is t seconds after launch. Bodies with an orbit (o) move; the rest stay put.
function bodyAt(b, t) {
  if (!b.o) return b;
  const a = b.o.p + b.o.w * t;
  return { x: b.o.cx + b.o.r * Math.cos(a), y: b.o.cy + b.o.r * Math.sin(a) };
}
// Angle in degrees, 0 = right, 90 = straight up. Power is launch speed.
function newShot(L, ang, pow) {
  return { x: L.s.x, y: L.s.y, vx: pow * Math.cos(ang * RAD), vy: -pow * Math.sin(ang * RAD), n: 0, hit: null };
}
// One 1/120 s step. Returns null (still flying), 'win', 'crash', 'lost' (left the field) or 'late' (out of time).
function step(L, S) {
  const t = S.n * STEP;
  let ax = 0, ay = 0;
  for (const b of L.b) {
    const p = bodyAt(b, t), dx = p.x - S.x, dy = p.y - S.y, d2 = dx * dx + dy * dy, d = Math.sqrt(d2) || 1;
    const g = b.mu / Math.max(d2, 100);
    ax += g * dx / d; ay += g * dy / d;
  }
  S.vx += ax * STEP; S.vy += ay * STEP; S.x += S.vx * STEP; S.y += S.vy * STEP; S.n++;
  const tx = L.t.x - S.x, ty = L.t.y - S.y, tr = L.t.r + ROCKET_R;
  if (tx * tx + ty * ty <= tr * tr) return 'win';
  const t2 = S.n * STEP;
  for (const b of L.b) {
    if (b.type === 'earth' && S.n <= GRACE) continue;
    const p = bodyAt(b, t2), dx = p.x - S.x, dy = p.y - S.y, r = b.r + ROCKET_R;
    if (dx * dx + dy * dy <= r * r) { S.hit = b.type; return 'crash'; }
  }
  if (S.x < -OUT || S.x > W + OUT || S.y < -OUT || S.y > H + OUT) return 'lost';
  if (S.n >= MAX_STEPS) return 'late';
  return null;
}
function fly(L, ang, pow) {
  const S = newShot(L, ang, pow);
  let r = null;
  while (!r) r = step(L, S);
  return { r, S };
}
// Every shot on a grid: angles -100..100 by half a degree, power 40..150 by 2.5.
// A "safe" shot wins, and still wins half a degree either side and one power point either side,
// so a player one click off still gets there. A level is winnable only if it has a safe shot.
// width = the widest run of winning angles at one power, in degrees: the size of the easiest window.
const GA = { lo: -100, hi: 100, d: 0.5 }, GP = { lo: PMIN, hi: PMAX, d: 2.5 };
function solve(L) {
  const na = Math.round((GA.hi - GA.lo) / GA.d) + 1, np = Math.round((GP.hi - GP.lo) / GP.d) + 1;
  const won = (a, p) => fly(L, a, p).r === 'win';
  let wins = 0, width = 0, best = null, bestRun = 0;
  for (let j = 0; j < np; j++) {
    const pow = GP.lo + j * GP.d;
    let run = 0;
    for (let i = 0; i <= na; i++) {
      if (i < na && won(GA.lo + i * GA.d, pow)) { wins++; run++; continue; }
      if (run >= 3) {
        const ang = GA.lo + (i - 1 - (run - 1) / 2) * GA.d, mid = Math.round(ang * 2) / 2;
        if (run > bestRun && won(mid, pow - 1) && won(mid, pow + 1) && won(mid - 0.5, pow) && won(mid + 0.5, pow)) { bestRun = run; best = { ang: mid, pow }; }
      }
      if (run) width = Math.max(width, (run - 1) * GA.d);
      run = 0;
    }
  }
  return { wins, shots: na * np, share: wins / (na * np), width, best };
}
