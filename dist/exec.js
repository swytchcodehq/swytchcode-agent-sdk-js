"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvocation = buildInvocation;
exports.resolveSwytchcodeBin = resolveSwytchcodeBin;
exports.exec = exec;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const errors_js_1 = require("./errors.js");
const LOG_PREFIX = "[swytchcode-runtime]";
const IS_WINDOWS = process.platform === "win32";
/**
 * cmd.exe metacharacters that must be caret-escaped so the shell treats them
 * literally. Matches the set used by cross-spawn (see https://qntm.org/cmd).
 */
const WIN_META_CHARS = /([()\][%!^"`<>&|;, *?])/g;
function escapeCmdMeta(s) {
    return s.replace(WIN_META_CHARS, "^$1");
}
/**
 * Escape a single argument so cmd.exe forwards it to the target as one literal
 * token: apply CommandLineToArgvW backslash/quote quoting, then escape cmd.exe
 * metacharacters. A `.cmd` shim re-enters cmd.exe, so metachars are escaped
 * twice. This prevents shell injection via an argument (e.g. a canonicalId
 * containing `&`, `|`, `>` …).
 */
function escapeCmdArgument(arg) {
    let a = String(arg);
    a = a.replace(/(\\*)"/g, '$1$1\\"'); // double backslashes before a quote, escape the quote
    a = a.replace(/(\\*)$/, "$1$1"); // double trailing backslashes (they precede the closing quote)
    a = `"${a}"`;
    a = escapeCmdMeta(a);
    a = escapeCmdMeta(a); // double-escape for the .cmd shim's inner cmd.exe
    return a;
}
/**
 * Build a safe spawnSync invocation for the resolved binary.
 *
 * A Windows `.cmd` shim can only be launched via cmd.exe. Rather than
 * `shell: true` — which joins arguments unescaped and allows command injection
 * — we invoke cmd.exe explicitly with our own escaped command line and
 * `windowsVerbatimArguments`, so no argument can break out into the shell.
 * On every other platform/binary we spawn directly with no shell at all.
 */
function buildInvocation(bin, args) {
    const isWinCmd = IS_WINDOWS && bin.toLowerCase().endsWith(".cmd");
    if (!isWinCmd) {
        return { command: bin, args, windowsVerbatimArguments: false };
    }
    const comspec = process.env.ComSpec || process.env.COMSPEC || "cmd.exe";
    const line = [escapeCmdMeta(bin), ...args.map(escapeCmdArgument)].join(" ");
    return {
        command: comspec,
        args: ["/d", "/s", "/c", `"${line}"`],
        windowsVerbatimArguments: true,
    };
}
/**
 * Resolve the swytchcode binary path using the following order:
 * 1. SWYTCHCODE_BIN env var — explicit override.
 * 2. node_modules/.bin/swytchcode — walk up from cwd (covers local npm installs).
 * 3. PATH lookup — the default; spawnSync will handle ENOENT if not found.
 * 4. Common install-path fallbacks for when PATH is not configured.
 */
function resolveSwytchcodeBin(startDir) {
    // 1. Explicit override
    const explicit = process.env.SWYTCHCODE_BIN?.trim();
    if (explicit)
        return explicit;
    // 2. Walk node_modules/.bin upward from startDir
    const binName = IS_WINDOWS ? "swytchcode.cmd" : "swytchcode";
    let dir = startDir;
    while (true) {
        const candidate = (0, node_path_1.join)(dir, "node_modules", ".bin", binName);
        if ((0, node_fs_1.existsSync)(candidate))
            return candidate;
        const parent = (0, node_path_1.resolve)(dir, "..");
        if (parent === dir)
            break; // reached filesystem root
        dir = parent;
    }
    // 3 & 4. PATH lookup with common install-path fallbacks
    const fallbacks = [];
    if (IS_WINDOWS) {
        if (process.env.APPDATA) {
            fallbacks.push((0, node_path_1.join)(process.env.APPDATA, "npm", "swytchcode.cmd"));
        }
        if (process.env.LOCALAPPDATA) {
            fallbacks.push((0, node_path_1.join)(process.env.LOCALAPPDATA, "Programs", "swytchcode", "bin", "swytchcode.exe"));
        }
    }
    else {
        fallbacks.push((0, node_path_1.join)(process.env.HOME ?? "", ".local", "bin", "swytchcode"), "/usr/local/bin/swytchcode");
    }
    for (const candidate of fallbacks) {
        if (candidate && (0, node_fs_1.existsSync)(candidate))
            return candidate;
    }
    return "swytchcode"; // fall through to PATH; spawnSync reports ENOENT if still missing
}
function isDebug(options) {
    return (options.debug === true ||
        process.env.SWYTCHCODE_RUNTIME_DEBUG === "1" ||
        process.env.SWYTCHCODE_RUNTIME_DEBUG === "true");
}
function log(debug, msg, detail) {
    if (!debug)
        return;
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
function exec(canonicalId, input, options = {}) {
    const debug = isDebug(options);
    const canonicalIdTrimmed = canonicalId.trim();
    if (canonicalIdTrimmed.length === 0) {
        log(debug, "reject:", "canonicalId is empty");
        return Promise.reject(new errors_js_1.SwytchcodeError("canonicalId must be a non-empty string", undefined));
    }
    const outputMode = options.output ?? (options.raw === true ? "raw" : "json");
    if (outputMode === "stream") {
        log(debug, "reject:", "stream mode not supported");
        return Promise.reject(new errors_js_1.SwytchcodeError("Stream mode is not supported; use the Swytchcode CLI directly", undefined));
    }
    const raw = outputMode === "raw";
    const args = ["exec", canonicalIdTrimmed, raw ? "--raw" : "--json"];
    if (options.dryRun === true)
        args.push("--dry-run");
    if (options.allowRaw === true)
        args.push("--allow-raw");
    const cwd = options.cwd ?? process.cwd();
    const hasInput = input !== undefined && input !== null;
    const bin = resolveSwytchcodeBin(cwd);
    log(debug, "binary:", bin);
    log(debug, "spawn:", `swytchcode ${args.join(" ")}`);
    if (options.dryRun === true)
        log(debug, "dry-run:", "enabled");
    if (options.allowRaw === true)
        log(debug, "allow-raw:", "enabled");
    log(debug, "cwd:", cwd);
    log(debug, "stdin:", hasInput ? `JSON (${JSON.stringify(input).length} chars)` : "none");
    const inv = buildInvocation(bin, args);
    const result = (0, node_child_process_1.spawnSync)(inv.command, inv.args, {
        cwd,
        env: { ...process.env, ...options.env },
        input: hasInput ? JSON.stringify(input) : undefined,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        windowsVerbatimArguments: inv.windowsVerbatimArguments,
        timeout: options.timeoutMs, // undefined = no timeout (default)
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
        if (result.error.code === "ETIMEDOUT") {
            return Promise.reject(new errors_js_1.SwytchcodeError(`swytchcode exec timed out after ${String(options.timeoutMs)}ms`, result.error));
        }
        const isNotFound = result.error.code === "ENOENT";
        const hint = isNotFound
            ? ` — install it with: npm install -g swytchcode (or set SWYTCHCODE_BIN=/path/to/binary)`
            : "";
        return Promise.reject(new errors_js_1.SwytchcodeError(`Failed to spawn swytchcode${hint}`, result.error));
    }
    if (result.status !== 0) {
        const message = result.signal != null
            ? `swytchcode exec failed (signal ${String(result.signal)})`
            : stderr || "swytchcode exec failed";
        log(debug, "reject:", `status ${result.status}, ${message.slice(0, 100)}`);
        return Promise.reject(new errors_js_1.SwytchcodeError(message, result.status ?? result.signal ?? stderr));
    }
    if (raw) {
        log(debug, "resolve:", `raw stdout (${(result.stdout ?? "").length} chars)`);
        return Promise.resolve(result.stdout ?? "");
    }
    // JSON mode: stdout only; no stderr fallback. Empty or invalid → throw.
    if (stdout.length === 0) {
        log(debug, "reject:", "empty stdout in JSON mode");
        return Promise.reject(new errors_js_1.SwytchcodeError("Empty stdout in JSON mode; swytchcode must write JSON to stdout", undefined));
    }
    try {
        const parsed = JSON.parse(stdout);
        log(debug, "resolve:", "parsed JSON ok");
        return Promise.resolve(parsed);
    }
    catch {
        log(debug, "reject:", "invalid JSON");
        return Promise.reject(new errors_js_1.SwytchcodeError("Invalid JSON output from swytchcode", stdout));
    }
}
