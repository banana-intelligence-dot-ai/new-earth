# New Earth

A browser game. Pull back, launch one rocket from Earth, and let gravity bend it to a new Earth. No steering. 100 levels.

**Play it:** https://new-earth-omega.vercel.app/

- **Play locally:** serve the folder (`python3 -m http.server`) and open it.
- **Physics:** `sim.js`, shared by the page, the level maker and the test. Same gravity and step as the mini game on natepeace.com.
- **Levels:** `npm run levels` writes `levels.js`. Each level is generated from its number, then kept only if the solver finds a safe winning shot. Difficulty is the size of the easiest winning window, in degrees of aim: about 5 at level 1, shrinking as the levels go up. Every level has a world on the line from Earth to New Earth, so no straight shot wins. Suns pull hardest, then planets, then moons. Along the way: more bodies, heavier pull, asteroids (level 16), moving planets (level 26), a satellite circling a world (level 36), the droid (level 56), smaller targets, a black hole (level 100). Asteroids, satellites and the droid have no pull but end the flight on contact.
- **Prove every level is winnable:** `npm test`. It flies every shot on a grid for all 100 levels and fails if any level has no safe shot (one that still wins half a degree or one power point off), or if any level can be won with gravity switched off.
- **Classic mode:** `classic/` is the first version, where you fly the rocket yourself against a robot's time. `npm run robot` refreshes `classic/robot.json`.
- **Build:** `npm run build` copies the site into `dist/` and runs seolint. Errors fail the build.
- **Data:** progress and best tries live in the player's browser only. Analytics is Vercel's cookieless page counter plus plain event names (launch, win, finish, share).
- **License:** MIT. Made by Banana Intelligence LLC.
