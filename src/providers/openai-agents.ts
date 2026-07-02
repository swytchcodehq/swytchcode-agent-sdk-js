import { Provider, Tool } from "./base.js";
import { tool } from "@openai/agents";

export class OpenAIAgentsProvider extends Provider {
  formatTool(t: Tool) {
    return tool({ 
      name: t.name, 
      description: t.description, 
      parameters: t.inputSchema as any,
      execute: async (a: any) => t.execute(a) 
    });
  }
}
