"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VercelProvider = void 0;
const base_js_1 = require("./base.js");
class VercelProvider extends base_js_1.Provider {
    async formatTool(t) {
        const { tool, jsonSchema } = await import("ai");
        return tool({
            description: t.description,
            parameters: jsonSchema(t.inputSchema),
            execute: (async (a) => t.execute(a))
        });
    }
    async formatTools(tools) {
        return Object.fromEntries(await Promise.all(tools.map(async (t) => [t.name, await this.formatTool(t)])));
    }
}
exports.VercelProvider = VercelProvider;
