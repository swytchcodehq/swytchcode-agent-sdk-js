/**
 * Thrown when `exec()` fails: spawn error, non-zero exit, signal, or invalid JSON output.
 */
export class SwytchcodeError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SwytchcodeError";
    this.cause = cause;
    Object.setPrototypeOf(this, SwytchcodeError.prototype);
  }
}

/**
 * Type guard for SwytchcodeError.
 */
export function isSwytchcodeError(e: unknown): e is SwytchcodeError {
  return e instanceof SwytchcodeError;
}
