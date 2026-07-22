import { exec } from "./exec.js";
import * as discover from "./discover.js";
import * as manage from "./manage.js";
import { simplify } from "./schema.js";
import { Provider, Tool } from "./providers/base.js";
import type { ExecOptions } from "./types.js";

/**
 * Recursively drop keys whose value is null/undefined or an empty string ("").
 * With "expose all fields", agents often fill unused optional fields with "",
 * which APIs like Stripe reject ("empty values are an attempt to unset").
 * Only null/undefined/"" are dropped — 0, false, [], {} are preserved.
 */
function stripEmpty(v: any): any {
  if (Array.isArray(v)) return v.map(stripEmpty);
  if (v && typeof v === "object") {
    const out: Record<string, any> = {};
    for (const [k, val] of Object.entries(v)) {
      if (val === null || val === undefined || val === "") continue;
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
function toolkitMatches(toolkit: string, integration: string): boolean {
  const tkl = toolkit.toLowerCase();
  const atIdx = integration.indexOf("@");
  const prefix = atIdx !== -1 ? integration.slice(0, atIdx) : integration;
  const dotIdx = prefix.indexOf(".");
  const project = prefix.slice(0, dotIdx !== -1 ? dotIdx : prefix.length).toLowerCase();
  const lib = dotIdx !== -1 ? prefix.slice(dotIdx + 1).toLowerCase() : "";
  return tkl === project || tkl === lib || tkl === prefix.toLowerCase();
}



class Tools {
  // Maps a sanitized tool name (dots -> underscores) back to its canonical ID,
  // populated as tools are built. Used to reverse names in handleToolCalls
  // without a lossy "_"->"." replace.
  private _nameToId = new Map<string, string>();
  constructor(private c: Swytchcode) {}

  async get(o: { toolkits?: string[]; tools?: string[]; search?: string } = {}) {
    const neutral = this._ids(o).map((cid) => this._tool(cid));
    return this.c.provider ? await this.c.provider.formatTools(neutral) : neutral;
  }

  execute(canonical_id: string, args: Record<string, any> = {}, options: ExecOptions & { _rawInputs?: any } = {}): Promise<any> {
    let finalArgs = { ...args };
    
    // Drop empty optional fields (null/undefined/"") so values
    // an agent over-filled don't reach the API (e.g. Stripe rejects customer="").
    finalArgs = stripEmpty(finalArgs);
    
    // Forward exec options (dryRun, raw, allowRaw, cwd, env) to the CLI.
    return exec(canonical_id, finalArgs, options);
  }

  private _tool(cid: string): Tool {
    const m = discover.info(cid);
    const name = cid.replace(/\./g,"_");
    this._nameToId.set(name, cid);
    const rawInputs = m.inputs;
    return {
      canonicalId: cid,
      name,
      description: m.summary || m.description || cid,
      inputSchema: simplify(m.inputs),
      execute: (a) => this.execute(cid, a, { _rawInputs: rawInputs })
    };
  }

  /** Reverse a sanitized tool name to its canonical ID (populated by get()). */
  nameToId(name: string): string {
    return this._nameToId.get(name) ?? name.replace(/_/g, ".");
  }

  private _ids(o: { toolkits?: string[]; tools?: string[]; search?: string }): string[] {
    if (o.tools) return o.tools;
    if (o.search) return discover.search(o.search).map((t:any) => t.canonical_id);
    if (o.toolkits) {
      const res = manage.listTools("tooling");
      const found = new Set<string>();
      for (const m of (res.methods || [])) {
        const integration = m.integration || "";
        const cid = m.canonical_id;
        if (!cid) continue;
        if (o.toolkits.some((tk) => toolkitMatches(tk, integration))) {
          found.add(cid);
        }
      }
      return [...found];
    }
    return [];
  }
}

export class Swytchcode {
  tools: Tools;
  constructor(public provider?: Provider) {
    this.tools = new Tools(this);
  }

  /**
   * Execute the tool calls in a non-agentic (Anthropic Messages) response and
   * return tool_result blocks to send back. Mirrors the Python handle_tool_calls.
   */
  async handleToolCalls(
    response: any
  ): Promise<Array<{ type: string; tool_use_id: string; content: string; is_error?: boolean }>> {
    const results: Array<{ type: string; tool_use_id: string; content: string; is_error?: boolean }> = [];
    for (const block of (response?.content ?? [])) {
      if (block?.type === "tool_use") {
        const cid = this.tools.nameToId(block.name);
        // Isolate failures per block: Anthropic expects a tool_result for every
        // tool_use in the turn, so one failing tool must not drop the others.
        try {
          const result = await this.tools.execute(cid, block.input ?? {});
          results.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: typeof result === "string" ? result : JSON.stringify(result),
          });
        } catch (err: any) {
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
