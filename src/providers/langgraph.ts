import { Provider, Tool } from "./base.js";
import { toZod } from "../schema.js";

// LangGraph consumes LangChain-core StructuredTool objects; the class is named
// after the framework developers integrate with (LangGraph), matching the
// Python runtime's LangGraphProvider.
export class LangGraphProvider extends Provider {
  async formatTool(t: Tool) {
    const { DynamicStructuredTool } = await import("@langchain/core/tools");
    return new DynamicStructuredTool({
      name: t.name,
      description: t.description,
      schema: toZod(t.inputSchema as any),
      func: async (a: Record<string,any>) => JSON.stringify(await t.execute(a))
    });
  }
}
