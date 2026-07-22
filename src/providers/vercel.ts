import { Provider, Tool } from "./base.js";
export class VercelProvider extends Provider {
  async formatTool(t: Tool) {
    const { tool, jsonSchema } = await import("ai");
    return tool({ 
      description: t.description, 
      inputSchema: jsonSchema(t.inputSchema as any),
      execute: (async (a: any) => t.execute(a)) as any
    } as any);
  }
  async formatTools(tools: Tool[]) { 
    return Object.fromEntries(
      await Promise.all(tools.map(async (t) => [t.name, await this.formatTool(t)]))
    );
  }
}
