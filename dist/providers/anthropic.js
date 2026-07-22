"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const base_js_1 = require("./base.js");
class AnthropicProvider extends base_js_1.Provider {
    formatTool(t) {
        return { name: t.name, description: t.description, input_schema: t.inputSchema };
    }
}
exports.AnthropicProvider = AnthropicProvider;
