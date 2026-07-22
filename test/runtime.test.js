const assert = require('node:assert');
const { test } = require('node:test');
const { simplify } = require('../dist/schema.js');

test('Schema correctly marks path parameters as required', () => {
    const rawSchema = [
        {
            "userId": {
                "TYPE": "STRING",
                "LOCATION": "path",
                "DESC": "The user ID"
            }
        },
        {
            "amount": {
                "TYPE": "INT",
                "LOCATION": "query"
            }
        }
    ];

    const simplified = simplify(rawSchema);

    // Path parameters should be forced to be required
    assert.deepStrictEqual(simplified.required, ["userId"]);
    assert.strictEqual(simplified.properties.userId.type, "string");
    assert.strictEqual(simplified.properties.amount.type, "integer");
});

test('Schema correctly marks JSON-Schema path parameters as required', () => {
    const rawSchema = {
        type: "object",
        properties: {
            "owner": { "type": "string", "location": "path" },
            "repo": { "type": "string", "location": "path" },
            "title": { "type": "string", "location": "body" }
        }
    };
    const simplified = simplify(rawSchema);
    assert.ok(simplified.required.includes("owner"));
    assert.ok(simplified.required.includes("repo"));
    assert.ok(!simplified.required.includes("title"));
});

test('VercelProvider uses inputSchema instead of parameters', async () => {
    const { VercelProvider } = require('../dist/providers/vercel.js');
    const provider = new VercelProvider();
    const toolDef = {
        canonicalId: "x.y",
        name: "x_y",
        description: "A test tool",
        inputSchema: { type: "object", properties: { a: { type: "string" } }, required: ["a"] },
        execute: async () => {}
    };
    const formatted = await provider.formatTool(toolDef);
    assert.ok(formatted.inputSchema !== undefined, 'Vercel tool must have inputSchema — model sees zero inputs');
});

test('Schema correctly marks array Wreken path parameters as required', () => {
    const rawSchema = [
        { "owner": { "TYPE": "STRING", "LOCATION": "path" } },
        { "title": { "TYPE": "STRING", "LOCATION": "body" } }
    ];
    const simplified = simplify(rawSchema);
    assert.ok(simplified.required.includes("owner"));
    assert.ok(!simplified.required.includes("title"));
});

test('CrewAIProvider produces correct duck-typed shape', async () => {
    const { CrewAIProvider } = require('../dist/providers/crewai.js');
    const provider = new CrewAIProvider();
    const toolDef = {
        canonicalId: "test.tool",
        name: "test_tool",
        description: "A crewai test tool",
        inputSchema: { type: "object", properties: { a: { type: "string" } }, required: ["a"] },
        execute: async (args) => { return args; }
    };
    const formatted = provider.formatTool(toolDef);
    assert.strictEqual(formatted.name, "test_tool");
    assert.strictEqual(formatted.description, "A crewai test tool");
    assert.deepStrictEqual(formatted.schema, toolDef.inputSchema);
    assert.strictEqual(typeof formatted.func, "function");
    
    // Ensure func returns stringified JSON as expected
    const res = await formatted.func({ a: "test" });
    assert.strictEqual(res, '{"a":"test"}');
});
