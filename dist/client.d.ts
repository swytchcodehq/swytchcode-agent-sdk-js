import { Provider } from "./providers/base.js";
import type { ExecOptions } from "./types.js";
declare class Tools {
    private c;
    private _nameToId;
    private _idToInputs;
    constructor(c: Swytchcode);
    get(o?: {
        toolkits?: string[];
        tools?: string[];
        search?: string;
    }): Promise<any[]>;
    execute(canonical_id: string, args?: Record<string, any>, options?: ExecOptions & {
        _rawInputs?: any;
    }): Promise<any>;
    private _tool;
    /** Reverse a sanitized tool name to its canonical ID (populated by get()). */
    nameToId(name: string): string;
    getInputs(cid: string): any;
    private _ids;
}
export declare class Swytchcode {
    provider?: Provider | undefined;
    tools: Tools;
    constructor(provider?: Provider | undefined);
    /**
     * Execute the tool calls in a non-agentic (Anthropic Messages) response and
     * return tool_result blocks to send back. Mirrors the Python handle_tool_calls.
     */
    handleToolCalls(response: any): Promise<Array<{
        type: string;
        tool_use_id: string;
        content: string;
        is_error?: boolean;
    }>>;
}
export {};
