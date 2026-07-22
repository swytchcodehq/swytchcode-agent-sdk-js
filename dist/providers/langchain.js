"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangChainProvider = void 0;
const base_js_1 = require("./base.js");
const tools_1 = require("@langchain/core/tools");
const schema_js_1 = require("../schema.js");
class LangChainProvider extends base_js_1.Provider {
    formatTool(t) {
        return new tools_1.DynamicStructuredTool({
            name: t.name,
            description: t.description,
            schema: (0, schema_js_1.toZod)(t.inputSchema),
            func: async (a) => JSON.stringify(await t.execute(a))
        });
    }
}
exports.LangChainProvider = LangChainProvider;
