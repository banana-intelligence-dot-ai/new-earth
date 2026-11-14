// SEO check on the built site (seolint 1.1.1, runs after the copy step). Errors fail the build.
export default {
  host: "https://new-earth-omega.vercel.app",
  inputs: ["dist"],
};
