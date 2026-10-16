import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";



/**
 * @description
 * Creates a fresh router instance, one per request on the server.
 *
 * @returns The application router.
 */
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultViewTransition: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
