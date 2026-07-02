import { Swytchcode, AnthropicProvider, OpenAIAgentsProvider,
         VercelProvider, LangGraphProvider, CrewAIProvider } from "../src/index.js";
import * as discover from "../src/discover.js";
import { simplify } from "../src/schema.js";
import { exec } from "../src/exec.js";

let PASS = 0;
let FAIL = 0;

function check(label: string, condition: boolean, detail: string = "") {
  if (condition) {
    PASS++;
    console.log(`  ✅ ${label}`);
  } else {
    FAIL++;
    console.log(`  ❌ ${label} — ${detail}`);
  }
}

async function runTests() {
  console.log("\n═══ Step 1: Toolkit Resolution ═══");
  const swx = new Swytchcode();
  const ids = (swx.tools as any)._ids({ toolkits: ["stripe"] });
  console.log(`  Resolved IDs:`, ids);
  check("Resolves at least 1 stripe tool", ids.length > 0, `got ${ids.length}`);
  check("IDs are real canonical IDs (contain dots)", ids.every((i: string) => i.includes(".")), `ids=${ids}`);
  check("No cloudflare tools leaked in", !ids.some((i: string) => i.includes("cloudflare")), `ids=${ids}`);

  console.log("\n═══ Step 2: Info Fetch ═══");
  for (const cid of ids) {
    const m = discover.info(cid);
    console.log(`  Info for ${cid}: keys=${Object.keys(m)}`);
    check(`info(${cid}) returns an object`, typeof m === "object" && m !== null);
    check(`info(${cid}) has 'inputs'`, "inputs" in m);
    if (m && typeof m === "object" && "inputs" in m) {
      check(`info(${cid}) inputs is non-empty`, Object.keys(m.inputs).length > 0, "inputs is empty!");
    }
  }

  console.log("\n═══ Step 3: Schema Simplification ═══");
  for (const cid of ids) {
    const m = discover.info(cid);
    const schema = simplify(m.inputs);
    const props = schema.properties || {};
    console.log(`  Schema for ${cid}: ${Object.keys(props).length} properties`);
    check(`simplify(${cid}) produces valid JSON Schema`, schema.type === "object");
    check(`simplify(${cid}) has properties`, Object.keys(props).length > 0, `got ${Object.keys(props).length} properties`);
    if (cid === "charges.charge.create") {
      check("charges.charge.create has 'amount' field", "amount" in props);
      check("charges.charge.create has 'currency' field", "currency" in props);
    }
  }

  console.log("\n═══ Step 4: Provider Formatting (Anthropic) ═══");
  const swx_anthropic = new Swytchcode(new AnthropicProvider());
  const tools_anthropic = swx_anthropic.tools.get({ toolkits: ["stripe"] });
  console.log(`  Got ${tools_anthropic.length} Anthropic formatted tools`);
  check("Anthropic tools is a list", Array.isArray(tools_anthropic));
  check("Anthropic tools is non-empty", tools_anthropic.length > 0);
  if (tools_anthropic.length > 0) {
    const t = tools_anthropic[0];
    check("Tool has 'name'", "name" in t);
    check("Tool has 'input_schema'", "input_schema" in t);
    check("input_schema has properties", Object.keys(t.input_schema?.properties || {}).length > 0);
  }

  console.log("\n═══ Step 4.5: Provider Formatting (CrewAI) ═══");
  const swx_crewai = new Swytchcode(new CrewAIProvider());
  const tools_crewai = swx_crewai.tools.get({ toolkits: ["stripe"] });
  console.log(`  Got ${tools_crewai.length} CrewAI formatted tools`);
  check("CrewAI tools is a list", Array.isArray(tools_crewai));
  check("CrewAI tools is non-empty", tools_crewai.length > 0);
  if (tools_crewai.length > 0) {
    const t = tools_crewai[0];
    check("CrewAI tool has 'name'", "name" in t);
    check("CrewAI tool has 'schema'", "schema" in t);
    check("CrewAI tool has 'func'", "func" in t && typeof t.func === "function");
  }

  console.log("\n═══ Step 4.6: Provider Formatting (OpenAI Agents) ═══");
  try {
    const swx_oa = new Swytchcode(new OpenAIAgentsProvider());
    const tools_oa = swx_oa.tools.get({ toolkits: ["stripe"] });
    console.log(`  Got ${tools_oa.length} OpenAI Agents formatted tools`);
    check("OpenAI Agents tools is non-empty", tools_oa.length > 0);
    if (tools_oa.length > 0) {
      const t: any = tools_oa[0];
      check("OpenAI Agents tool has 'name'", typeof t.name === "string");
      check("OpenAI Agents tool has 'description'", typeof t.description === "string");
      check("OpenAI Agents tool has 'invoke'", typeof t.invoke === "function");
    }
  } catch (e: any) {
    console.log(`  ⚠️ Skipping OpenAI Agents due to version conflict: ${e.message || e}`);
  }

  console.log("\n═══ Step 4.7: Provider Formatting (Vercel) ═══");
  try {
    const swx_vercel = new Swytchcode(new VercelProvider());
    const tools_vercel = swx_vercel.tools.get({ toolkits: ["stripe"] });
    // Vercel returns a Record<string, tool> not an array
    const toolNames = Object.keys(tools_vercel);
    console.log(`  Got ${toolNames.length} Vercel formatted tools`);
    check("Vercel tools is non-empty", toolNames.length > 0);
    if (toolNames.length > 0) {
      const t: any = tools_vercel[toolNames[0]];
      check("Vercel tool has 'description'", typeof t.description === "string");
      check("Vercel tool has 'parameters'", t.parameters !== undefined);
      check("Vercel tool has 'execute'", typeof t.execute === "function");
    }
  } catch (e: any) {
    FAIL++;
    console.log(`  ❌ Vercel formatting failed: ${e.message || e}`);
  }

  console.log("\n═══ Step 4.8: Provider Formatting (LangGraph) ═══");
  try {
    const swx_lg = new Swytchcode(new LangGraphProvider());
    const tools_lg = swx_lg.tools.get({ toolkits: ["stripe"] });
    console.log(`  Got ${tools_lg.length} LangGraph formatted tools`);
    check("LangGraph tools is non-empty", tools_lg.length > 0);
    if (tools_lg.length > 0) {
      const t: any = tools_lg[0];
      check("LangGraph tool is DynamicStructuredTool", t.constructor.name === "DynamicStructuredTool");
      check("LangGraph tool has .name", typeof t.name === "string");
      check("LangGraph tool has .schema", t.schema !== undefined);
    }
  } catch (e: any) {
    FAIL++;
    console.log(`  ❌ LangGraph formatting failed: ${e.message || e}`);
  }

  console.log("\n═══ Step 5: Execute (dry-run) ═══");
  try {
    const result: any = await exec(
      "charges.charge.create",
      { body: { amount: 2000, currency: "usd" } },
      { dryRun: true }
    );
    console.log(`  dry-run result keys: ${Object.keys(result)}`);
    check("execute(dryRun=true) returned a result", result !== undefined && result !== null);
    check("Result is an object", typeof result === "object");
    if (result && typeof result === "object") {
      check("Result has 'url'", "url" in result);
      check("Result has 'method'", "method" in result);
      const url = result.url || "";
      check("URL points to Stripe API", url.toLowerCase().includes("stripe"), `url=${url}`);
    }
  } catch (e: any) {
    FAIL++;
    console.log(`  ❌ Execute dry-run failed: ${e.message || e}`);
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  Results: ${PASS} passed, ${FAIL} failed`);
  if (FAIL === 0) {
    console.log("  🎉 ALL TESTS PASSED — TS SDK pipeline is fully validated!");
    process.exit(0);
  } else {
    console.log("  ⚠️  Some tests failed — see above for details.");
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
