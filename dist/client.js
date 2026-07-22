"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swytchcode = void 0;
const exec_js_1 = require("./exec.js");
const discover = __importStar(require("./discover.js"));
const manage = __importStar(require("./manage.js"));
const schema_js_1 = require("./schema.js");
/**
 * Recursively drop keys whose value is null/undefined or an empty string ("").
 * With "expose all fields", agents often fill unused optional fields with "",
 * which APIs like Stripe reject ("empty values are an attempt to unset").
 * Only null/undefined/"" are dropped — 0, false, [], {} are preserved.
 */
function stripEmpty(v) {
    if (Array.isArray(v))
        return v.map(stripEmpty);
    if (v && typeof v === "object") {
        const out = {};
        for (const [k, val] of Object.entries(v)) {
            if (val === null || val === undefined || val === "")
                continue;
            out[k] = stripEmpty(val);
        }
        return out;
    }
    return v;
}
/**
 * Case-insensitive match of a toolkit name against an integration string.
 * integration has shape "ProjectDisplayName.library_slug@version"
 * (e.g. "GitHub.github@1.1.4"). Compares against both project name and
 * library slug so toolkits: ["github"] matches regardless of casing.
 */
function toolkitMatches(toolkit, integration) {
    const tkl = toolkit.toLowerCase();
    const atIdx = integration.indexOf("@");
    const prefix = atIdx !== -1 ? integration.slice(0, atIdx) : integration;
    const dotIdx = prefix.indexOf(".");
    const project = prefix.slice(0, dotIdx !== -1 ? dotIdx : prefix.length).toLowerCase();
    const lib = dotIdx !== -1 ? prefix.slice(dotIdx + 1).toLowerCase() : "";
    return tkl === project || tkl === lib || tkl === prefix.toLowerCase();
}
/**
 * Route flat args into body/params based on LOCATION metadata from wrekenfile.
 */
function splitByLocation(inputs, flatArgs) {
    const body = {};
    const params = {};
    const locations = {};
    if (Array.isArray(inputs)) {
        for (const item of inputs) {
            if (item && typeof item === "object") {
                for (const [name, spec] of Object.entries(item)) {
                    if (spec && typeof spec === "object") {
                        const loc = (spec.LOCATION || spec.location || "body").toLowerCase();
                        locations[name] = loc;
                    }
                }
            }
        }
    }
    else if (inputs && typeof inputs === "object" && inputs.properties && typeof inputs.properties === "object") {
        for (const [name, spec] of Object.entries(inputs.properties)) {
            if (spec && typeof spec === "object") {
                const loc = (spec.LOCATION || spec.location || "body").toLowerCase();
                locations[name] = loc;
            }
        }
    }
    for (const [k, v] of Object.entries(flatArgs)) {
        const loc = locations[k] || "body";
        if (loc === "path" || loc === "query") {
            params[k] = v;
        }
        else {
            body[k] = v;
        }
    }
    const result = {};
    if (Object.keys(body).length > 0)
        result.body = body;
    if (Object.keys(params).length > 0)
        result.params = params;
    return result;
}
class Tools {
    c;
    // Maps a sanitized tool name (dots -> underscores) back to its canonical ID,
    // populated as tools are built. Used to reverse names in handleToolCalls
    // without a lossy "_"->"." replace.
    _nameToId = new Map();
    _idToInputs = new Map();
    constructor(c) {
        this.c = c;
    }
    async get(o = {}) {
        const neutral = this._ids(o).map((cid) => this._tool(cid));
        return this.c.provider ? await this.c.provider.formatTools(neutral) : neutral;
    }
    execute(canonical_id, args = {}, options = {}) {
        let finalArgs = { ...args };
        if (!("body" in finalArgs) && !("params" in finalArgs)) {
            if (options._rawInputs) {
                finalArgs = splitByLocation(options._rawInputs, finalArgs);
            }
            else {
                finalArgs = { body: finalArgs };
            }
        }
        // Drop empty optional fields (null/undefined/"") so values
        // an agent over-filled don't reach the API (e.g. Stripe rejects customer="").
        if (finalArgs.body && typeof finalArgs.body === "object") {
            finalArgs.body = stripEmpty(finalArgs.body);
        }
        if (finalArgs.params && typeof finalArgs.params === "object") {
            finalArgs.params = stripEmpty(finalArgs.params);
        }
        // Forward exec options (dryRun, raw, allowRaw, cwd, env) to the CLI.
        return (0, exec_js_1.exec)(canonical_id, finalArgs, options);
    }
    _tool(cid) {
        const m = discover.info(cid);
        const name = cid.replace(/\./g, "_");
        this._nameToId.set(name, cid);
        const rawInputs = m.inputs;
        this._idToInputs.set(cid, rawInputs);
        return {
            canonicalId: cid,
            name,
            description: m.summary || m.description || cid,
            inputSchema: (0, schema_js_1.simplify)(rawInputs),
            execute: (a) => this.execute(cid, a, { _rawInputs: rawInputs })
        };
    }
    /** Reverse a sanitized tool name to its canonical ID (populated by get()). */
    nameToId(name) {
        return this._nameToId.get(name) ?? name.replace(/_/g, ".");
    }
    getInputs(cid) {
        return this._idToInputs.get(cid);
    }
    _ids(o) {
        if (o.tools)
            return o.tools;
        if (o.search)
            return discover.search(o.search).map((t) => t.canonical_id);
        if (o.toolkits) {
            const res = manage.listTools("tooling");
            const found = new Set();
            for (const m of (res.methods || [])) {
                const integration = m.integration || "";
                const cid = m.canonical_id;
                if (!cid)
                    continue;
                if (o.toolkits.some((tk) => toolkitMatches(tk, integration))) {
                    found.add(cid);
                }
            }
            return [...found];
        }
        return [];
    }
}
class Swytchcode {
    provider;
    tools;
    constructor(provider) {
        this.provider = provider;
        this.tools = new Tools(this);
    }
    /**
     * Execute the tool calls in a non-agentic (Anthropic Messages) response and
     * return tool_result blocks to send back. Mirrors the Python handle_tool_calls.
     */
    async handleToolCalls(response) {
        const results = [];
        for (const block of (response?.content ?? [])) {
            if (block?.type === "tool_use") {
                const cid = this.tools.nameToId(block.name);
                const rawInputs = this.tools.getInputs(cid) || {};
                // Isolate failures per block: Anthropic expects a tool_result for every
                // tool_use in the turn, so one failing tool must not drop the others.
                try {
                    const result = await this.tools.execute(cid, block.input ?? {}, { _rawInputs: rawInputs });
                    results.push({
                        type: "tool_result",
                        tool_use_id: block.id,
                        content: typeof result === "string" ? result : JSON.stringify(result),
                    });
                }
                catch (err) {
                    results.push({
                        type: "tool_result",
                        tool_use_id: block.id,
                        content: `Error executing ${cid}: ${err?.message ?? String(err)}`,
                        is_error: true,
                    });
                }
            }
        }
        return results;
    }
}
exports.Swytchcode = Swytchcode;
