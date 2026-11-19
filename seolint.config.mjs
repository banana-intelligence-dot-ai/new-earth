// SEO check on the built site (seolint 1.1.1, runs after the copy step). Errors fail the build.
// The game's home is https://www.natepeace.com/games/new-earth/ (natepeace.com serves this deployment),
// so canonicals and the sitemap use that address. The old vercel.app address still plays.
// seolint maps the host to the root of dist, which no longer matches, so the checks that compare
// canonicals and sitemap entries with the build's own paths are off. The rest still run.
export default {
  host: "https://www.natepeace.com",
  inputs: ["dist"],
  rules: {
    // Links are relative on purpose, so the game works at its own domain root and under /games/new-earth/.
    "link.internal.https": false,
    "canonical.href.self": false,
    "site.canonical.exists": false,
    "site.sitemap.entries": false,
  },
};
