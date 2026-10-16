import { TRPCClientError } from "@trpc/client";



const TRANSIENT_CODES = new Set(["TOO_MANY_REQUESTS", "BAD_GATEWAY", "GATEWAY_TIMEOUT", "SERVICE_UNAVAILABLE", "TIMEOUT"]);
const MAX_RETRIES = 3;

/**
 * @description
 * Reads the tRPC error code of a failed request.
 *
 * @param error - Error thrown by a query.
 * @returns The tRPC error code, or null for network and unknown errors.
 */
export function getErrorCode(error: unknown): string | null {
  if (error instanceof TRPCClientError) {
    const code: unknown = error.data?.code;

    return typeof code === "string" ? code : null;
  }

  return null;
}

/**
 * @description
 * Checks whether a request failed because Steam is rate limiting.
 *
 * @param error - Error thrown by a query.
 * @returns Whether the error is a rate limit.
 */
export function isRateLimitError(error: unknown): boolean {
  return getErrorCode(error) === "TOO_MANY_REQUESTS";
}

/**
 * @description
 * Retries network failures and transient upstream errors, never client errors such as unknown profiles.
 *
 * @param failureCount - Number of failed attempts so far.
 * @param error - Last error.
 * @returns Whether to retry.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  const code = getErrorCode(error);

  if (code !== null && !TRANSIENT_CODES.has(code)) {
    return false;
  }

  return failureCount < MAX_RETRIES;
}

/**
 * @description
 * Backs off exponentially, waiting longer when Steam is rate limiting.
 *
 * @param attempt - Zero based retry attempt.
 * @param error - Last error.
 * @returns Delay before the next attempt, in milliseconds.
 */
export function retryDelay(attempt: number, error: unknown): number {
  const base = isRateLimitError(error) ? 5_000 : 1_000;

  return Math.min(base * 2 ** attempt, 30_000);
}
