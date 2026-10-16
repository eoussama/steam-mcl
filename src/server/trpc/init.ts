import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";

import type { TSteamErrorCode } from "../steam";

import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { SteamError } from "../steam";

import "@tanstack/react-start/server-only";



const STEAM_TO_TRPC_CODES: Readonly<Record<TSteamErrorCode, TRPC_ERROR_CODE_KEY>> = {
  not_found: "NOT_FOUND",
  private: "FORBIDDEN",
  rate_limited: "TOO_MANY_REQUESTS",
  timeout: "GATEWAY_TIMEOUT",
  upstream: "BAD_GATEWAY",
  invalid_response: "BAD_GATEWAY",
};

function getPublicMessage(error: TRPCError, fallback: string): string {
  // Never forward internal details, such as upstream URLs carrying the API key or raw schema issues.
  if (error.code === "INTERNAL_SERVER_ERROR") {
    return "Something went wrong";
  }

  if (error.cause instanceof ZodError) {
    return "The request is invalid";
  }

  return fallback;
}

const t = initTRPC.create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    message: getPublicMessage(error, shape.message),
    data: {
      code: shape.data.code,
      httpStatus: shape.data.httpStatus,
      path: shape.data.path,
    },
  }),
});

const steamErrors = t.middleware(async ({ next }) => {
  const result = await next();

  if (!result.ok && result.error.cause instanceof SteamError) {
    const cause = result.error.cause;

    throw new TRPCError({ code: STEAM_TO_TRPC_CODES[cause.code], message: cause.message });
  }

  return result;
});

export const router = t.router;

export const publicProcedure = t.procedure.use(steamErrors);
