"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
class Provider {
    async formatTools(tools) {
        return Promise.all(tools.map((t) => this.formatTool(t)));
    }
}
exports.Provider = Provider;
