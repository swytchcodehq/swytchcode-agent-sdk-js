import { Provider, Tool } from "./base.js";
export declare class AnthropicProvider extends Provider {
    formatTool(t: Tool): {
        name: string;
        description: string;
        input_schema: {
            type: string;
            properties: Record<string, any>;
            required: string[];
        };
    };
}
