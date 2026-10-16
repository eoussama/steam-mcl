export type TSteamErrorCode = "not_found" | "private" | "rate_limited" | "timeout" | "upstream" | "invalid_response";

/**
 * @description
 * Error raised when a Steam service fails or answers in an unexpected way.
 */
export class SteamError extends Error {
  override readonly name = "SteamError";

  /**
   * @description
   * Creates a Steam error.
   *
   * @param code - Machine readable failure reason.
   * @param message - Human readable description.
   * @param options - Standard error options, such as the underlying cause.
   */
  constructor(readonly code: TSteamErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
