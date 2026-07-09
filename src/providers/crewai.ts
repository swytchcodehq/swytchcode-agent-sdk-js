import { Provider, Tool } from "./base.js";

// CrewAI TS is a community port.
export class CrewAIProvider extends Provider {
  formatTool(t: Tool) {
    // Verified: The crewai NPM package does not export a native Tool class.
    // It delegates to Langchain under the hood, and its Agent constructor
    // accepts these duck-typed plain objects for tools.
    return {
      name: t.name,
      description: t.description,
      schema: t.inputSchema,                           // JSON schema from simplify()
      func: async (a: Record<string, any>) => JSON.stringify(await t.execute(a)),
    };
  }
}
