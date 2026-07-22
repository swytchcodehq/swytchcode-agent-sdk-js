import { Provider, Tool } from "./base.js";
export declare class OpenAIAgentsProvider extends Provider {
    formatTool(t: Tool): Promise<import("@openai/agents-core").FunctionTool<unknown, undefined, string>>;
}
