# New Earth

A one-file browser game. Fly a rocket from Earth past 100 gravity bodies to a new Earth. Three ships. Fastest time wins.

- **Play locally:** open `index.html`, or serve the folder (`python3 -m http.server`) so the robot's time loads.
- **Today's course:** the seed is today's date in Eastern time, looked up in `robot.json`. Everyone gets the same course each day. `?seed=11` flies the original course.
- **The robot's time:** `npm run robot` flies the robot pilot (`test/bot.mjs`, settings in `ROBOT`) over the next 45 days of courses and writes `robot.json`. A seed the robot cannot finish without losing a ship is skipped for the next one. Days past the end of the file still get a course, with no robot time shown. Re-run before the file runs out.
- **Prove a course is beatable:** `node test/bot.mjs <seed>` (exit 0 means the robot reached New Earth).
- **Build:** `npm run build` copies the site into `dist/` and runs seolint. Errors fail the build.
- **Data:** best times live in the player's browser only. Analytics is Vercel's cookieless page counter plus three plain event names (launch, finish, share).
