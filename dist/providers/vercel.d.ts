import { Provider, Tool } from "./base.js";
export declare class VercelProvider extends Provider {
    formatTool(t: Tool): Promise<({
        title?: string;
        providerOptions?: import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ProviderOptions;
        metadata?: import("@ai-sdk/provider", { with: { "resolution-mode": "import" } }).JSONObject;
        inputSchema: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown>;
        contextSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context> | undefined;
        needsApproval?: boolean | import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolNeedsApprovalFunction<unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>> | undefined;
        onInputStart?: ((options: import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputDelta?: ((options: {
            inputTextDelta: string;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputAvailable?: ((options: {
            input: unknown;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        toModelOutput?: ((options: {
            toolCallId: string;
            input: unknown;
            output: unknown;
        }) => import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput | PromiseLike<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput>) | undefined;
    } & {
        outputSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown> | undefined;
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    } & {
        description?: string | ((options: {
            context: NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>;
            experimental_sandbox?: import("ai", { with: { "resolution-mode": "import" } }).Experimental_SandboxSession;
        }) => string) | undefined;
        strict?: boolean;
        inputExamples?: {
            input: unknown;
        }[] | undefined;
        id?: never;
        isProviderExecuted?: never;
        args?: never;
        supportsDeferredResults?: never;
    } & {
        type?: undefined | "function";
    } & {
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    }) | ({
        title?: string;
        providerOptions?: import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ProviderOptions;
        metadata?: import("@ai-sdk/provider", { with: { "resolution-mode": "import" } }).JSONObject;
        inputSchema: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown>;
        contextSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context> | undefined;
        needsApproval?: boolean | import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolNeedsApprovalFunction<unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>> | undefined;
        onInputStart?: ((options: import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputDelta?: ((options: {
            inputTextDelta: string;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputAvailable?: ((options: {
            input: unknown;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        toModelOutput?: ((options: {
            toolCallId: string;
            input: unknown;
            output: unknown;
        }) => import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput | PromiseLike<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput>) | undefined;
    } & {
        outputSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown> | undefined;
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    } & {
        description?: string | ((options: {
            context: NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>;
            experimental_sandbox?: import("ai", { with: { "resolution-mode": "import" } }).Experimental_SandboxSession;
        }) => string) | undefined;
        strict?: boolean;
        inputExamples?: {
            input: unknown;
        }[] | undefined;
        id?: never;
        isProviderExecuted?: never;
        args?: never;
        supportsDeferredResults?: never;
    } & {
        type: "dynamic";
    } & {
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    }) | ({
        title?: string;
        providerOptions?: import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ProviderOptions;
        metadata?: import("@ai-sdk/provider", { with: { "resolution-mode": "import" } }).JSONObject;
        inputSchema: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown>;
        contextSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context> | undefined;
        needsApproval?: boolean | import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolNeedsApprovalFunction<unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>> | undefined;
        onInputStart?: ((options: import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputDelta?: ((options: {
            inputTextDelta: string;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputAvailable?: ((options: {
            input: unknown;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        toModelOutput?: ((options: {
            toolCallId: string;
            input: unknown;
            output: unknown;
        }) => import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput | PromiseLike<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput>) | undefined;
    } & {
        outputSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown> | undefined;
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    } & {
        type: "provider";
        id: `${string}.${string}`;
        args: Record<string, unknown>;
        description?: never;
        strict?: never;
        inputExamples?: never;
    } & {
        isProviderExecuted: false;
        supportsDeferredResults?: never;
    } & {
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    }) | ({
        title?: string;
        providerOptions?: import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ProviderOptions;
        metadata?: import("@ai-sdk/provider", { with: { "resolution-mode": "import" } }).JSONObject;
        inputSchema: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown>;
        contextSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context> | undefined;
        needsApproval?: boolean | import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolNeedsApprovalFunction<unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>> | undefined;
        onInputStart?: ((options: import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputDelta?: ((options: {
            inputTextDelta: string;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        onInputAvailable?: ((options: {
            input: unknown;
        } & import("ai", { with: { "resolution-mode": "import" } }).ToolExecutionOptions<NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>) => void | PromiseLike<void>) | undefined;
        toModelOutput?: ((options: {
            toolCallId: string;
            input: unknown;
            output: unknown;
        }) => import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput | PromiseLike<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).ToolResultOutput>) | undefined;
    } & {
        outputSchema?: import("ai", { with: { "resolution-mode": "import" } }).FlexibleSchema<unknown> | undefined;
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    } & {
        type: "provider";
        id: `${string}.${string}`;
        args: Record<string, unknown>;
        description?: never;
        strict?: never;
        inputExamples?: never;
    } & {
        isProviderExecuted: true;
        supportsDeferredResults?: boolean;
    } & {
        execute: import("ai", { with: { "resolution-mode": "import" } }).ToolExecuteFunction<unknown, unknown, NoInfer<import("@ai-sdk/provider-utils", { with: { "resolution-mode": "import" } }).Context>>;
    })>;
    formatTools(tools: Tool[]): Promise<any>;
}
