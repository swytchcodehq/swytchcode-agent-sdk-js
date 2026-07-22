"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangGraphProvider = void 0;
const base_js_1 = require("./base.js");
const schema_js_1 = require("../schema.js");
// LangGraph consumes LangChain-core StructuredTool objects; the class is named
// after the framework developers integrate with (LangGraph), matching the
// Python runtime's LangGraphProvider.
class LangGraphProvider extends base_js_1.Provider {
    async formatTool(t) {
        const { DynamicStructuredTool } = await import("@langchain/core/tools");
        return new DynamicStructuredTool({
            name: t.name,
            description: t.description,
            schema: (0, schema_js_1.toZod)(t.inputSchema),
            func: async (a) => JSON.stringify(await t.execute(a))
        });
    }
}
exports.LangGraphProvider = LangGraphProvider;
