export interface Tool {
    canonicalId: string;
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
    execute: (args: Record<string, any>) => Promise<any>;
}
export declare abstract class Provider {
    abstract formatTool(t: Tool): any | Promise<any>;
    formatTools(tools: Tool[]): Promise<any[]>;
}
