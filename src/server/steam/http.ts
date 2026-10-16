import type { z } from "zod";

import { retry, TimeoutError, withTimeout } from "@eoussama/core";
import { SteamError } from "./errors";

import "@tanstack/react-start/server-only";



type TRequestOptions = {
  /**
   * How long a successful response is reused by this server instance, in milliseconds.
   */
  cacheTtl?: number;
};

const REQUEST_TIMEOUT = 10_000;
const MAX_RETRIES = 2;
const MAX_CACHE_ENTRIES = 1_000;
const USER_AGENT = "steam-mcl (+https://github.com/eoussama/steam-mcl)";

const cache = new Map<string, { expiresAt: number; value: unknown }>();

function readCache(key: string): unknown {
  const entry = cache.get(key);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);

    return undefined;
  }

  return entry.value;
}

function writeCache(key: string, value: unknown, ttl: number): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;

    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }

  cache.set(key, { expiresAt: Date.now() + ttl, value });
}

function backoff(attempt: number): number {
  return 400 * 2 ** (attempt - 1);
}

/**
 * @description
 * Retries brief upstream hiccups only. Rate limits span minutes on Steam, so they are reported straight away
 * and the client decides when to try again instead of holding a function invocation open.
 *
 * @param error - Error thrown by the request.
 * @returns Whether to retry.
 */
function isBriefFailure(error: unknown): boolean {
  return error instanceof SteamError && (error.code === "timeout" || error.code === "upstream");
}

async function fetchOnce(url: URL): Promise<unknown> {
  let response: Response;

  try {
    response = await withTimeout(
      fetch(url, { headers: { "accept": "application/json", "user-agent": USER_AGENT } }),
      REQUEST_TIMEOUT,
    );
  }
  catch (error) {
    if (error instanceof TimeoutError) {
      throw new SteamError("timeout", "Steam took too long to respond", { cause: error });
    }

    throw new SteamError("upstream", "Could not reach Steam", { cause: error });
  }

  if (response.status === 429) {
    throw new SteamError("rate_limited", "Steam is rate limiting requests");
  }

  if (response.status >= 500) {
    throw new SteamError("upstream", `Steam answered with status ${response.status}`);
  }

  if (!response.ok) {
    throw new SteamError("invalid_response", `Steam answered with status ${response.status}`);
  }

  try {
    return await response.json();
  }
  catch (error) {
    throw new SteamError("invalid_response", "Steam answered with malformed JSON", { cause: error });
  }
}

/**
 * @description
 * Fetches and validates a JSON document from Steam, retrying transient failures with backoff.
 *
 * @param url - Absolute URL to fetch.
 * @param schema - Schema the response must satisfy.
 * @param options - Request options.
 * @returns The validated response.
 */
export async function requestJson<TSchema extends z.ZodType>(
  url: URL,
  schema: TSchema,
  options: TRequestOptions = {},
): Promise<z.infer<TSchema>> {
  const key = url.toString();
  const cached = readCache(key);

  if (cached !== undefined) {
    return cached as z.infer<TSchema>;
  }

  const raw = await retry(() => fetchOnce(url), {
    retries: MAX_RETRIES,
    delay: backoff,
    shouldRetry: isBriefFailure,
  });

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    throw new SteamError("invalid_response", "Steam answered with an unexpected payload", { cause: parsed.error });
  }

  if (options.cacheTtl) {
    writeCache(key, parsed.data, options.cacheTtl);
  }

  return parsed.data;
}
