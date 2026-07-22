import { Provider, Tool } from "./base.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
export declare class LangChainProvider extends Provider {
    formatTool(t: Tool): DynamicStructuredTool<import("zod").ZodObject<{
        [x: string]: import("zod").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>;
    }, import("zod/v4/core").$strip>, Record<string, any>, Record<string, unknown>, string, unknown, string>;
}
