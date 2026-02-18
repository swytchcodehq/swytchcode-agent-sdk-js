/** Output mode: JSON (default), raw string, or stream (not supported in this runtime). */
export type OutputMode = "json" | "raw" | "stream";

export interface ExecOptions {
  /** Working directory for the swytchcode process. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Extra environment variables merged with `process.env`. */
  env?: Record<string, string>;
  /**
   * Output mode. Default is `"json"` (stdout must be valid JSON; parse failure throws).
   * Use `"raw"` to get stdout as a string. `"stream"` is not supported; use the CLI directly.
   */
  output?: OutputMode;
  /** If true, same as `output: "raw"`. Kept for backward compatibility. */
  raw?: boolean;
  /** If true, pass `--dry-run` to the CLI; request details are output instead of calling the server. */
  dryRun?: boolean;
  /** If true, pass `--allow-raw` to the CLI; required for executing raw methods (disabled by default in kernel). */
  allowRaw?: boolean;
  /** If true, log spawn/capture details to process.stderr (for debugging). */
  debug?: boolean;
}

/** Result of `exec()` in JSON mode: parsed stdout. In raw mode the result is a string. */
export type ExecResult = unknown;

/**
 * Tool arguments sent to the kernel on stdin (matches `swytchcode exec` JSON stdin).
 * - `body`: Request body (object).
 * - `params`: Query/path params (object).
 * - `Authorization`: Auth header value (e.g. "Bearer token").
 * - `headers`: Additional request headers (map of header name to value).
 * - Other top-level keys are passed as query params.
 */
export interface ExecArgs {
  body?: unknown;
  params?: Record<string, string>;
  Authorization?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}
