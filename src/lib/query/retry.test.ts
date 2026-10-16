import { TRPCClientError } from "@trpc/client";
import { describe, expect, it } from "vitest";

import { getErrorCode, retryDelay, shouldRetry } from "./retry";



function trpcError(code: string) {
  return new TRPCClientError("failed", { result: { error: { message: "failed", code: -1, data: { code } } } });
}

describe("shouldRetry", () => {
  it("never retries client errors", () => {
    expect(shouldRetry(0, trpcError("NOT_FOUND"))).toBe(false);
    expect(shouldRetry(0, trpcError("BAD_REQUEST"))).toBe(false);
  });

  it("retries transient and network errors a few times", () => {
    expect(shouldRetry(0, trpcError("TOO_MANY_REQUESTS"))).toBe(true);
    expect(shouldRetry(2, new TypeError("Failed to fetch"))).toBe(true);
    expect(shouldRetry(3, trpcError("BAD_GATEWAY"))).toBe(false);
  });
});

describe("retryDelay", () => {
  it("backs off longer when rate limited, up to a cap", () => {
    expect(retryDelay(0, trpcError("TOO_MANY_REQUESTS"))).toBe(5_000);
    expect(retryDelay(1, trpcError("BAD_GATEWAY"))).toBe(2_000);
    expect(retryDelay(10, trpcError("BAD_GATEWAY"))).toBe(30_000);
  });
});

describe("getErrorCode", () => {
  it("reads tRPC codes and ignores other errors", () => {
    expect(getErrorCode(trpcError("NOT_FOUND"))).toBe("NOT_FOUND");
    expect(getErrorCode(new Error("x"))).toBeNull();
  });
});

describe("retry edge cases", () => {
  it.each(["TOO_MANY_REQUESTS", "BAD_GATEWAY", "GATEWAY_TIMEOUT", "SERVICE_UNAVAILABLE", "TIMEOUT"])("retries %s", (code) => {
    expect(shouldRetry(0, new TRPCClientError("failed", { result: { error: { message: "failed", code: -32000, data: { code } } } }))).toBe(true);
  });

  it("only reads codes from tRPC errors", () => {
    expect(getErrorCode({ data: { code: "NOT_FOUND" } })).toBeNull();
    expect(getErrorCode(new TRPCClientError("failed"))).toBeNull();
    expect(getErrorCode(new TRPCClientError("failed", { result: { error: { message: "failed", code: -32000, data: { code: 404 } } } }))).toBeNull();
  });
});
