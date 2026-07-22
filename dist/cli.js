"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
const node_child_process_1 = require("node:child_process");
const exec_js_1 = require("./exec.js");
const errors_js_1 = require("./errors.js");
function runCli(args, opts = {}) {
    const cmd = args.includes("--json") ? args : [...args, "--json"];
    const bin = (0, exec_js_1.resolveSwytchcodeBin)(opts.cwd ?? process.cwd());
    const inv = (0, exec_js_1.buildInvocation)(bin, cmd);
    const timeoutMs = opts.timeoutMs ?? 60_000;
    const r = (0, node_child_process_1.spawnSync)(inv.command, inv.args, {
        cwd: opts.cwd ?? process.cwd(), env: { ...process.env, ...opts.env },
        encoding: "utf8", maxBuffer: 10 * 1024 * 1024,
        windowsVerbatimArguments: inv.windowsVerbatimArguments,
        timeout: timeoutMs,
    });
    if (r.error) {
        if (r.error.code === "ETIMEDOUT")
            throw new errors_js_1.SwytchcodeError(`swytchcode command timed out after ${timeoutMs}ms`, r.error);
        throw new errors_js_1.SwytchcodeError("Failed to spawn swytchcode; is the CLI installed?", r.error);
    }
    if (r.status !== 0)
        throw new errors_js_1.SwytchcodeError((r.stderr ?? "").trim() || "command failed", r.status);
    const out = (r.stdout ?? "").trim();
    if (!out)
        return null;
    try {
        return JSON.parse(out);
    }
    catch {
        throw new errors_js_1.SwytchcodeError("Invalid JSON from swytchcode", out);
    }
}
