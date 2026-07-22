"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.info = info;
const cli_js_1 = require("./cli.js");
function search(intent, top = 5) {
    try {
        const res = (0, cli_js_1.runCli)(["discover", intent, "--top", String(top)]) ?? {};
        return res.capabilities ?? [];
    }
    catch (e) {
        // Degrade gracefully on CLI failure, matching info() below.
        console.warn(`Warning: Failed to search for "${intent}" (${e}). Returning no results.`);
        return [];
    }
}
function info(canonicalId) {
    try {
        const res = (0, cli_js_1.runCli)(["info", canonicalId]) ?? {};
        return Array.isArray(res) ? (res[0] ?? {}) : res; // CLI returns a JSON array
    }
    catch (e) {
        console.warn(`Warning: Failed to fetch info for ${canonicalId} (${e}). Using empty schema.`);
        return { canonical_id: canonicalId, inputs: {} };
    }
}
