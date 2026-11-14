# New Earth

A browser game. Pull back, launch one rocket from Earth, and let gravity bend it to a new Earth. No steering. 10 levels for now, 100 generated and ready.

- **Play locally:** serve the folder (`python3 -m http.server`) and open it.
- **Physics:** `sim.js`, shared by the page, the level maker and the test. Same gravity and step as the mini game on natepeace.com.
- **Levels:** `levels.js` is what ships (10 levels). `levels-pool.js` holds all 100 generated levels, unpublished. To ship more, add rows to `PICKS` in `scripts/pick-levels.mjs` and run `npm run pick`. The game reads the count from the file; only the head tags, `llms.txt` and the share image name the count in words. `npm run levels` regenerates the pool: each level is made from its number, then kept only if the solver finds a safe winning shot.
- **Prove every level is winnable:** `npm test`. It flies every shot on a grid for each shipped level and fails if a level has no safe shot (one that still wins half a degree or one power point off), or if a level's easiest winning window is wider than the level before it. `npm run test:pool` runs the same proof on all 100.
- **Classic mode:** `classic/` is the first version, where you fly the rocket yourself against a robot's time. `npm run robot` refreshes `classic/robot.json`.
- **Build:** `npm run build` copies the site into `dist/` and runs seolint. Errors fail the build.
- **Data:** progress and best tries live in the player's browser only. Analytics is Vercel's cookieless page counter plus plain event names (launch, win, finish, share).
