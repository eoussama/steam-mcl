import dx from "@eoussama/dx";



export default dx(
  {
    react: true,
    ignores: [
      "src/routeTree.gen.ts",
      ".output/**",
      ".vercel/**",
      ".nitro/**",
      ".tanstack/**",
    ],
  },
  {
    // Route modules export a `Route` object, HMR for them is handled by the TanStack router plugin.
    files: ["src/routes/**"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
