"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewAIProvider = void 0;
const base_js_1 = require("./base.js");
// CrewAI TS is a community port.
class CrewAIProvider extends base_js_1.Provider {
    formatTool(t) {
        // Verified: The crewai NPM package does not export a native Tool class.
        // It delegates to Langchain under the hood, and its Agent constructor
        // accepts these duck-typed plain objects for tools.
        return {
            name: t.name,
            description: t.description,
            schema: t.inputSchema, // JSON schema from simplify()
            func: async (a) => JSON.stringify(await t.execute(a)),
        };
    }
}
exports.CrewAIProvider = CrewAIProvider;
