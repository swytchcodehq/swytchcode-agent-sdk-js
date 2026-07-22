import { Provider, Tool } from "./base.js";
export class OpenAIAgentsProvider extends Provider {
  async formatTool(t: Tool) {
    const { tool } = await import("@openai/agents");
    // strict: false - our simplified schemas expose all fields but mark only the
    // truly-required ones. OpenAI's strict function mode requires every property
    // to appear in `required` (plus additionalProperties:false), so a strict tool
    // 400s server-side on a partial-required schema. Disabling strict mirrors the
    // Python provider's strict_json_schema=False.
    return tool({
      name: t.name.slice(0, 64),
      description: t.description,
      parameters: t.inputSchema as any,
      strict: false,
      execute: async (a: any) => t.execute(a)
    } as any);
  }
}
