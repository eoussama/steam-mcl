import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";



/**
 * @description
 * TanStack Query and Router devtools, only loaded during development.
 *
 * @returns The devtools panels.
 */
export const Devtools: React.FC = () => (
  <>
    <ReactQueryDevtools buttonPosition="bottom-left" />
    <TanStackRouterDevtools position="bottom-right" />
  </>
);
