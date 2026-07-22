"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIAgentsProvider = void 0;
const base_js_1 = require("./base.js");
class OpenAIAgentsProvider extends base_js_1.Provider {
    async formatTool(t) {
        const { tool } = await import("@openai/agents");
        // strict: false - our simplified schemas expose all fields but mark only the
        // truly-required ones. OpenAI's strict function mode requires every property
        // to appear in `required` (plus additionalProperties:false), so a strict tool
        // 400s server-side on a partial-required schema. Disabling strict mirrors the
        // Python provider's strict_json_schema=False.
        return tool({
            name: t.name.slice(0, 64),
            description: t.description,
            parameters: t.inputSchema,
            strict: false,
            execute: async (a) => t.execute(a)
        });
    }
}
exports.OpenAIAgentsProvider = OpenAIAgentsProvider;
