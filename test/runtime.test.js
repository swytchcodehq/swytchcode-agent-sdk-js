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

test('VercelProvider uses parameters instead of inputSchema', async () => {
    const { VercelProvider } = require('../dist/providers/vercel.js');
    const provider = new VercelProvider();
    const toolDef = {
        name: "test_tool",
        description: "A test tool",
        inputSchema: { type: "object", properties: { a: { type: "string" } } },
        execute: async () => {}
    };
    const formatted = await provider.formatTool(toolDef);
    assert.ok(formatted.parameters !== undefined, 'Vercel tool must have parameters');
    // internal Vercel AI SDK checks
});
