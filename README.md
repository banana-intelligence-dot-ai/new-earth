# New Earth

A browser game. Pull back, launch one rocket from Earth, and let gravity bend it to a new Earth. No steering. 100 levels.

- **Play locally:** serve the folder (`python3 -m http.server`) and open it.
- **Physics:** `sim.js`, shared by the page, the level maker and the test. Same gravity and step as the mini game on natepeace.com.
- **Levels:** `npm run levels` writes `levels.js`. Each level is generated from its number, then kept only if the solver finds a safe winning shot. Difficulty is the size of the easiest winning window, in degrees of aim: about 8 at level 1 down to about 1 at level 100. Along the way: more bodies, heavier pull, moving planets (level 26), smaller targets, shots that must swing around a world (level 66), a black hole (level 100).
- **Prove every level is winnable:** `npm test`. It flies every shot on a grid for all 100 levels and fails if any level has no safe shot (one that still wins half a degree or one power point off).
- **Classic mode:** `classic/` is the first version, where you fly the rocket yourself against a robot's time. `npm run robot` refreshes `classic/robot.json`.
- **Build:** `npm run build` copies the site into `dist/` and runs seolint. Errors fail the build.
- **Data:** progress and best tries live in the player's browser only. Analytics is Vercel's cookieless page counter plus plain event names (launch, win, finish, share).
