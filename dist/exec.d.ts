import type { ExecArgs, ExecOptions, ExecResult } from "./types.js";
/**
 * Build a safe spawnSync invocation for the resolved binary.
 *
 * A Windows `.cmd` shim can only be launched via cmd.exe. Rather than
 * `shell: true` — which joins arguments unescaped and allows command injection
 * — we invoke cmd.exe explicitly with our own escaped command line and
 * `windowsVerbatimArguments`, so no argument can break out into the shell.
 * On every other platform/binary we spawn directly with no shell at all.
 */
export declare function buildInvocation(bin: string, args: string[]): {
    command: string;
    args: string[];
    windowsVerbatimArguments: boolean;
};
/**
 * Resolve the swytchcode binary path using the following order:
 * 1. SWYTCHCODE_BIN env var — explicit override.
 * 2. node_modules/.bin/swytchcode — walk up from cwd (covers local npm installs).
 * 3. PATH lookup — the default; spawnSync will handle ENOENT if not found.
 * 4. Common install-path fallbacks for when PATH is not configured.
 */
export declare function resolveSwytchcodeBin(startDir: string): string;
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
export declare function exec(canonicalId: string, input?: ExecArgs | unknown, options?: ExecOptions): Promise<ExecResult>;
