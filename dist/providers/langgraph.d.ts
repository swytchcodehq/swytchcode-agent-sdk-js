import { Provider, Tool } from "./base.js";
export declare class LangGraphProvider extends Provider {
    formatTool(t: Tool): Promise<import("@langchain/core/tools", { with: { "resolution-mode": "import" } }).DynamicStructuredTool<import("zod").ZodObject<{
        [x: string]: import("zod").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>;
    }, import("zod/v4/core").$strip>, Record<string, any>, Record<string, unknown>, string, unknown, string>>;
}
