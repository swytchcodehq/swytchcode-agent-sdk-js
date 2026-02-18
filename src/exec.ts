import { spawnSync } from "node:child_process";
import type { ExecArgs, ExecOptions, ExecResult } from "./types.js";
import { SwytchcodeError } from "./errors.js";

const LOG_PREFIX = "[swytchcode-runtime]";

function isDebug(options: ExecOptions): boolean {
  return (
    options.debug === true ||
    process.env.SWYTCHCODE_RUNTIME_DEBUG === "1" ||
    process.env.SWYTCHCODE_RUNTIME_DEBUG === "true"
  );
}

function log(debug: boolean, msg: string, detail?: string): void {
  if (!debug) return;
  const line = detail ? `${LOG_PREFIX} ${msg} ${detail}\n` : `${LOG_PREFIX} ${msg}\n`;
  process.stderr.write(line);
}

/**
 * Run `swytchcode exec <canonicalId>` with optional JSON args on stdin.
 * Default is JSON mode (stdout must be valid JSON; empty or parse failure throws).
 * Use output: "raw" or raw: true for raw stdout string. Stream mode is not supported.
 *
 * The second argument (input) is the kernel args object sent on stdin: use body, params,
 * Authorization, and headers so the kernel builds the request correctly. See ExecArgs.
 *
 * Enable logs: pass `{ debug: true }` or set env SWYTCHCODE_RUNTIME_DEBUG=1
 */
export function exec(
  canonicalId: string,
  input?: ExecArgs | unknown,
  options: ExecOptions = {}
): Promise<ExecResult> {
  const debug = isDebug(options);

  const canonicalIdTrimmed = canonicalId.trim();
  if (canonicalIdTrimmed.length === 0) {
    log(debug, "reject:", "canonicalId is empty");
    return Promise.reject(
      new SwytchcodeError("canonicalId must be a non-empty string", undefined)
    );
  }

  const outputMode = options.output ?? (options.raw === true ? "raw" : "json");
  if (outputMode === "stream") {
    log(debug, "reject:", "stream mode not supported");
    return Promise.reject(
      new SwytchcodeError(
        "Stream mode is not supported; use the Swytchcode CLI directly",
        undefined
      )
    );
  }

  const raw = outputMode === "raw";
  const args = ["exec", canonicalIdTrimmed, raw ? "--raw" : "--json"];
  if (options.dryRun === true) args.push("--dry-run");
  if (options.allowRaw === true) args.push("--allow-raw");
  const cwd = options.cwd ?? process.cwd();
  const hasInput = input !== undefined && input !== null;

  log(debug, "spawn:", `swytchcode ${args.join(" ")}`);
  if (options.dryRun === true) log(debug, "dry-run:", "enabled");
  if (options.allowRaw === true) log(debug, "allow-raw:", "enabled");
  log(debug, "cwd:", cwd);
  log(debug, "stdin:", hasInput ? `JSON (${JSON.stringify(input).length} chars)` : "none");

  const result = spawnSync("swytchcode", args, {
    cwd,
    env: { ...process.env, ...options.env },
    input: hasInput ? JSON.stringify(input) : undefined,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024, // 10MB
  });

  const stdoutRaw = result.stdout ?? "";
  const stderrRaw = result.stderr ?? "";
  const stdout = stdoutRaw.trim();
  const stderr = stderrRaw.trim();

  log(debug, "exit status:", String(result.status));
  log(debug, "exit signal:", String(result.signal ?? "none"));
  log(debug, "stdout length:", String(stdoutRaw.length));
  log(debug, "stderr length:", String(stderrRaw.length));
  if (stdoutRaw.length > 0) {
    const preview = stdoutRaw.length > 400 ? stdoutRaw.slice(0, 400) + "..." : stdoutRaw;
    log(debug, "stdout preview:", JSON.stringify(preview));
  }
  if (stderrRaw.length > 0) {
    const preview = stderrRaw.length > 400 ? stderrRaw.slice(0, 400) + "..." : stderrRaw;
    log(debug, "stderr preview:", JSON.stringify(preview));
  }

  if (result.error) {
    log(debug, "reject:", "spawn error");
    return Promise.reject(
      new SwytchcodeError("Failed to spawn swytchcode", result.error)
    );
  }

  if (result.status !== 0) {
    const message =
      result.signal != null
        ? `swytchcode exec failed (signal ${String(result.signal)})`
        : stderr || "swytchcode exec failed";
    log(debug, "reject:", `status ${result.status}, ${message.slice(0, 100)}`);
    return Promise.reject(
      new SwytchcodeError(message, result.status ?? result.signal ?? stderr)
    );
  }

  if (raw) {
    log(debug, "resolve:", `raw stdout (${(result.stdout ?? "").length} chars)`);
    return Promise.resolve(result.stdout ?? "");
  }

  // JSON mode: stdout only; no stderr fallback. Empty or invalid → throw.
  if (stdout.length === 0) {
    log(debug, "reject:", "empty stdout in JSON mode");
    return Promise.reject(
      new SwytchcodeError(
        "Empty stdout in JSON mode; swytchcode must write JSON to stdout",
        undefined
      )
    );
  }

  try {
    const parsed = JSON.parse(stdout) as ExecResult;
    log(debug, "resolve:", "parsed JSON ok");
    return Promise.resolve(parsed);
  } catch {
    log(debug, "reject:", "invalid JSON");
    return Promise.reject(
      new SwytchcodeError("Invalid JSON output from swytchcode", stdout)
    );
  }
}
