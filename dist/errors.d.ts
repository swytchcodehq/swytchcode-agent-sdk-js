/**
 * Thrown when `exec()` fails: spawn error, non-zero exit, signal, or invalid JSON output.
 */
export declare class SwytchcodeError extends Error {
    readonly cause?: unknown;
    constructor(message: string, cause?: unknown);
}
/**
 * Type guard for SwytchcodeError.
 */
export declare function isSwytchcodeError(e: unknown): e is SwytchcodeError;
