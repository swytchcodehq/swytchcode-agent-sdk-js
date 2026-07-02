import { exec } from "./exec.js";
import * as discover from "./discover.js";
import * as manage from "./manage.js";
import { simplify } from "./schema.js";
import { Provider, Tool } from "./providers/base.js";

class Tools {
  constructor(private c: Swytchcode) {}

  get(o: { toolkits?: string[]; tools?: string[]; search?: string } = {}) {
    const neutral = this._ids(o).map((cid) => this._tool(cid));
    return this.c.provider ? this.c.provider.formatTools(neutral) : neutral;
  }

  execute(cid: string, args: Record<string,any>): Promise<any> {
    if (!("body" in args) && !("params" in args)) args = { body: args };
    return exec(cid, args);
  }

  private _tool(cid: string): Tool {
    const m = discover.info(cid);
    return { 
      canonicalId: cid, 
      name: cid.replace(/\./g,"_"),
      description: m.summary || m.description || cid,
      inputSchema: simplify(m.inputs), 
      execute: (a) => this.execute(cid, a) 
    };
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
}
