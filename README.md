# swytchcode-runtime

Thin runtime wrapper around the Swytchcode CLI. Calls `swytchcode exec` for you so you can stay in TypeScript/JavaScript without shell boilerplate.

**Requires:** The `swytchcode` CLI must be installed. The binary is located automatically — no configuration needed in most environments. Resolution order:

1. `SWYTCHCODE_BIN` env var — explicit override.
2. `node_modules/.bin/swytchcode` — walked up from the working directory (covers local `npm install swytchcode`).
3. `$PATH` lookup — the standard system resolution.
4. Common install paths — `~/.local/bin`, `/usr/local/bin` (Unix) or `%LOCALAPPDATA%\Programs\swytchcode\bin` (Windows).

By default, the runtime runs Swytchcode in **JSON mode**: the CLI is invoked with `--json` and stdout must be valid JSON; empty stdout or parse failure throws. For **raw** output, use `output: "raw"` (or `raw: true`). For **streaming** output, use the Swytchcode CLI directly; this library does not support stream mode.

## Install

```bash
npm install swytchcode-runtime
```

## Use

### JSON mode (default)

```ts
import { exec } from "swytchcode-runtime";

const result = await exec("api.account.create", {
  body: { name: "my-cluster" },
  Authorization: "Bearer token123",
});
// result is parsed JSON (unknown)
```

Equivalent to: `swytchcode exec api.account.create --json` with args on stdin.

**Request input (args):** The second argument is the kernel **args** object (sent as JSON on stdin). Use this shape so the kernel builds the request correctly:
- **`body`** — Request body (object).
- **`params`** — Query/path params (object, e.g. `{ id: "cluster-123" }`).
- **`Authorization`** — Auth header value (e.g. `"Bearer token123"`).
- **`headers`** — Additional request headers (e.g. `{ "X-Request-Id": "abc-123" }`).
- Other top-level keys are passed as query params.

Example with body, params, and headers:

```ts
await exec("api.cluster.get", {
  params: { id: "cluster-123" },
  Authorization: "Bearer token123",
  headers: { "X-Request-Id": "abc-123" },
});
```

### Raw mode

Get stdout as a string instead of parsing JSON:

```ts
import { exec } from "swytchcode-runtime";

const output = await exec("api.report.export", { id: "123" }, { raw: true });
// output is the raw stdout string
```

Equivalent to: `swytchcode exec api.report.export --raw` with input on stdin.

### Options

- **`cwd`** – Working directory for the process (default: `process.cwd()`).
- **`env`** – Extra environment variables (merged with `process.env`).
- **`output`** – `"json"` (default), `"raw"`, or `"stream"`. Default is JSON (stdout must be valid JSON; parse failure throws). Use `"raw"` to get stdout as a string. `"stream"` is not supported and will throw; use the CLI directly for streaming.
- **`raw`** – If `true`, same as `output: "raw"`. Kept for backward compatibility.
- **`dryRun`** – If `true`, pass `--dry-run` to the CLI; the CLI outputs request details (method, url, headers, body) instead of calling the server.
- **`allowRaw`** – If `true`, pass `--allow-raw` to the CLI; required for executing raw methods (kernel has this disabled by default).
- **`debug`** – If `true`, log spawn args, cwd, exit status, and stdout/stderr lengths to stderr.

This runtime invokes `swytchcode exec [canonical_id]` with the flags above. For full exec behavior (exit codes, output format, pipeline), see the [Swytchcode kernel documentation](https://gitlab.com/swytchcode/swytchcode-runtime).

### Environment variables

| Variable | Description |
|----------|-------------|
| `SWYTCHCODE_BIN` | Override the resolved binary path. Set this only when automatic resolution does not find the correct binary (e.g. non-standard install locations). |
| `SWYTCHCODE_TOKEN` | Auth token passed to the CLI via the process environment. |
| `SWYTCHCODE_RUNTIME_DEBUG` | Set to `1` or `true` to enable debug logging (same as `{ debug: true }`). |

**Debug logs** are also enabled when `SWYTCHCODE_RUNTIME_DEBUG=1` or `SWYTCHCODE_RUNTIME_DEBUG=true` (no code change):

```bash
SWYTCHCODE_RUNTIME_DEBUG=1 node index.js
```

Or in code: `exec("shell.integration.list", undefined, { debug: true })`.

### Error handling

Failures throw `SwytchcodeError` (spawn error, non-zero exit, signal, empty stdout in JSON mode, invalid JSON). Use the type guard when you need to narrow:

```ts
import { exec, isSwytchcodeError } from "swytchcode-runtime";

try {
  await exec("api.account.create", { email: "test@example.com" });
} catch (e) {
  if (isSwytchcodeError(e)) {
    console.error(e.message, e.cause);
  }
  throw e;
}
```

## What this library is

- A thin process wrapper over the Swytchcode shell.
- A stable call surface: `exec(canonicalId, input?, options?)`.
- A convenience for developers and IDE agents.

## What this library is not

- An HTTP SDK or API client.
- A replacement for the shell. All authority stays in the Swytchcode CLI.

This library **must not** and **does not**:

- Read `.swytchcode/*` or parse `tooling.json`.
- Validate schemas or add retries/timeouts.
- Call the registry or embed auth logic.

It is a pipe, not a brain.


## For Cursor / IDE agents

Generate code that uses this runtime instead of subprocess boilerplate.

**Preferred:**

```ts
import { exec } from "swytchcode-runtime";

export async function createAccount(input: { email: string }) {
  return exec("api.account.create", input);
}
```

**Avoid:** subprocess boilerplate, HTTP calls, or config parsing. Use `exec(...)` and let the CLI handle execution and policy.

## Agentic workflows (framework integrations)

On top of `exec`, the runtime exposes a small agentic surface that turns Swytchcode tools
into the native tool objects each agent framework expects. The Swytchcode part is the same
two lines regardless of framework:

```ts
import { Swytchcode, AnthropicProvider } from "swytchcode-runtime";

const swx = new Swytchcode(new AnthropicProvider());
const tools = swx.tools.get({ toolkits: ["stripe"] }); // framework-native tools, required-fields-only
```

### Selecting tools — `swx.tools.get({ ... })`

Pass exactly one selector; IDs resolve against your local Swytchcode state and remote search:

- `{ toolkits: ["stripe"] }` — every enabled tool whose integration matches a toolkit.
- `{ tools: ["charges.charge.create"] }` — explicit canonical IDs.
- `{ search: "refund a charge" }` — natural-language discovery (via `swytchcode discover`).

Each returned tool carries a **required-fields-only** input schema — optional fields are not
surfaced to the model — and an `execute` callback that runs `swytchcode exec` for you.

### Supported providers

| Framework | Export | Result of `tools.get` |
|-----------|--------|-----------------------|
| Anthropic Claude | `AnthropicProvider` | array of `{ name, description, input_schema }` |
| OpenAI Agents SDK | `OpenAIAgentsProvider` | array of `@openai/agents` tools |
| Vercel AI SDK | `VercelProvider` | **object** keyed by tool name (pass to `tools:` in `ai`) |
| LangGraph | `LangGraphProvider` | array of `@langchain/core` `DynamicStructuredTool` |
| CrewAI | `CrewAIProvider` | array of duck-typed tool objects |

The framework SDKs are optional peer dependencies — install only the one you use
(`@openai/agents`, `ai`, `@langchain/core`, …). See `sdk-examples/` for end-to-end usage.
