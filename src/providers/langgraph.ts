import { Provider, Tool } from "./base.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { toZod } from "../schema.js";

// LangGraph consumes LangChain-core StructuredTool objects; the class is named
// after the framework developers integrate with (LangGraph), matching the
// Python runtime's LangGraphProvider.
export class LangGraphProvider extends Provider {
  formatTool(t: Tool) {
    return new DynamicStructuredTool({
      name: t.name,
      description: t.description,
      schema: toZod(t.inputSchema as any),
      func: async (a: Record<string,any>) => JSON.stringify(await t.execute(a))
    });
  }
}
