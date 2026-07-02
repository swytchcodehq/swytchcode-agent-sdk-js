import { Provider, Tool } from "./base.js";

export class AnthropicProvider extends Provider {
  formatTool(t: Tool) { 
    return { name: t.name, description: t.description, input_schema: t.inputSchema }; 
  }
}
