import { exec } from "./exec.js";
import * as discover from "./discover.js";
import * as manage from "./manage.js";
import { simplify } from "./schema.js";
import { Provider, Tool } from "./providers/base.js";
import type { ExecOptions } from "./types.js";

class Tools {
  // Maps a sanitized tool name (dots -> underscores) back to its canonical ID,
  // populated as tools are built. Used to reverse names in handleToolCalls
  // without a lossy "_"->"." replace.
  private _nameToId = new Map<string, string>();
  constructor(private c: Swytchcode) {}

  get(o: { toolkits?: string[]; tools?: string[]; search?: string } = {}) {
    const neutral = this._ids(o).map((cid) => this._tool(cid));
    return this.c.provider ? this.c.provider.formatTools(neutral) : neutral;
  }

  execute(cid: string, args: Record<string,any>, options: ExecOptions = {}): Promise<any> {
    if (!("body" in args) && !("params" in args)) args = { body: args };
    // Forward exec options (dryRun, raw, allowRaw, cwd, env) to the CLI.
    return exec(cid, args, options);
  }

  private _tool(cid: string): Tool {
    const m = discover.info(cid);
    const name = cid.replace(/\./g,"_");
    this._nameToId.set(name, cid);
    return {
      canonicalId: cid,
      name,
      description: m.summary || m.description || cid,
      inputSchema: simplify(m.inputs),
      execute: (a) => this.execute(cid, a)
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
      const found: string[] = [];
      for (const m of (res.methods || [])) {
        const integration = m.integration || "";
        for (const tk of o.toolkits) {
          if (integration.includes(tk)) {
            found.push(m.canonical_id);
          }
        }
      }
      return found;
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
  ): Promise<Array<{ type: string; tool_use_id: string; content: string }>> {
    const results: Array<{ type: string; tool_use_id: string; content: string }> = [];
    for (const block of (response?.content ?? [])) {
      if (block?.type === "tool_use") {
        const cid = this.tools.nameToId(block.name);
        const result = await this.tools.execute(cid, block.input ?? {});
        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: typeof result === "string" ? result : JSON.stringify(result),
        });
      }
    }
    return results;
  }
}
