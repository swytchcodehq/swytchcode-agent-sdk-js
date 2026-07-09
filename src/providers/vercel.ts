import { Provider, Tool } from "./base.js";
import { tool, jsonSchema } from "ai";

export class VercelProvider extends Provider {
  formatTool(t: Tool) {
    return tool({ 
      description: t.description, 
      parameters: jsonSchema(t.inputSchema as any),
      execute: (async (a: any) => t.execute(a)) as any
    } as any);
  }
  formatTools(tools: Tool[]) { 
    return Object.fromEntries(tools.map((t) => [t.name, this.formatTool(t)])); 
  }
}
