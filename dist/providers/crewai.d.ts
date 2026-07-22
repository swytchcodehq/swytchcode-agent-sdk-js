import { Provider, Tool } from "./base.js";
export declare class CrewAIProvider extends Provider {
    formatTool(t: Tool): {
        name: string;
        description: string;
        schema: {
            type: string;
            properties: Record<string, any>;
            required: string[];
        };
        func: (a: Record<string, any>) => Promise<string>;
    };
}
