// Flies the robot over each coming day's course and writes robot.json.
// Run: node scripts/robot-times.mjs [days=45] [startDate=today in Eastern time]
// A day's seed is its date as a number (20261113). If the robot cannot finish that course
// without losing a ship, the seed is skipped and the next one (date + k * 100000000) is tried.
import fs from 'fs';
import { fly, ROBOT } from '../test/bot.mjs';

const days = +(process.argv[2] || 45);
const start = process.argv[3] || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
const out = { robot: ROBOT, made: start, seeds: {}, days: {} };
const clean = r => r.win && r.deaths.length === 0 && r.bodies === 100;

const classic = fly(11);
if (clean(classic)) out.seeds[11] = +classic.time.toFixed(1);

const d = new Date(start + 'T12:00:00Z');
for (let i = 0; i < days; i++, d.setUTCDate(d.getUTCDate() + 1)) {
  const day = d.toISOString().slice(0, 10), base = +day.replace(/-/g, '');
  let done = false;
  for (let k = 0; k < 8 && !done; k++) {
    const seed = base + k * 100000000, r = fly(seed);
    if (clean(r)) { out.days[day] = { seed, robot: +r.time.toFixed(1) }; done = true; }
    else console.log(`  skip seed ${seed} (${r.win ? 'lost a ship' : 'did not finish, body ' + r.body})`);
  }
  console.log(day, done ? JSON.stringify(out.days[day]) : 'NO COURSE FOUND');
  if (!done) process.exitCode = 1;
}
fs.writeFileSync(new URL('../classic/robot.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
