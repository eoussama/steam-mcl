import type { TAppRouter } from "@/server/trpc/router";

import { createTRPCClient, httpLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";



export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<TAppRouter>();

/**
 * @description
 * Creates the tRPC client. Requests are not batched so each lookup gets its own URL, which lets the CDN
 * cache and share them across visitors.
 *
 * @returns The tRPC client.
 */
export function makeTrpcClient() {
  return createTRPCClient<TAppRouter>({
    links: [httpLink({ url: "/api/trpc" })],
  });
}
