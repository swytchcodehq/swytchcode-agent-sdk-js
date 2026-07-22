"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplify = simplify;
exports.toZod = toZod;
const zod_1 = require("zod");
function simplify(inputs) {
    if (Array.isArray(inputs)) {
        const properties = {};
        const required = [];
        for (const item of inputs) {
            if (!item || typeof item !== "object")
                continue;
            for (const [name, spec] of Object.entries(item)) {
                if (!spec || typeof spec !== "object")
                    continue;
                let t = String(spec.TYPE ?? "STRING").toLowerCase();
                if (t === "int")
                    t = "integer";
                else if (t === "bool")
                    t = "boolean";
                else if (t === "object" || t === "any")
                    t = "object";
                else if (t.startsWith("[]"))
                    t = "array";
                else if (t === "float" || t === "number" || t === "double")
                    t = "number";
                else
                    t = "string";
                properties[name] = { type: t, ...(spec.DESC ? { description: spec.DESC } : {}) };
                const req = spec.REQUIRED;
                const loc = String(spec.LOCATION || spec.location || "").toLowerCase();
                const isRequired = loc === "path" || req === true || (typeof req === "string" && req.trim().toLowerCase() === "true");
                if (isRequired)
                    required.push(name);
            }
        }
        // Composio-style rule: expose ALL fields to the model and list only the
        // truly-required ones in `required`. A required-only approach hid optional
        // fields — which left all-optional tools (e.g. Stripe) with an empty schema
        // so the model called them with no arguments, and blinded the model to
        // optional fields on tools that do have some required ones.
        return { type: "object", properties, required };
    }
    if (!inputs || typeof inputs !== "object") {
        return { type: "object", properties: {}, required: [] };
    }
    const properties = inputs.properties || {};
    const required = Array.isArray(inputs.required) ? inputs.required : [];
    const keep = {};
    // Expose ALL fields (same rule as the array branch above); use the original
    // required list only for the `required` key so optional/nested fields stay
    // optional instead of being dropped or forced required.
    for (const name of Object.keys(properties)) {
        let spec = properties[name] || {};
        // JSON-Schema tools might have LOCATION metadata. Mark path params as required.
        const loc = String(spec.LOCATION || spec.location || "").toLowerCase();
        if (loc === "path" && !required.includes(name)) {
            required.push(name);
        }
        if (typeof spec === "object" && spec !== null && spec.type === "object" && spec.properties) {
            spec = simplify(spec);
        }
        keep[name] = spec;
    }
    return { type: "object", properties: keep, required: required.filter((n) => n in keep) };
}
function toZod(s) {
    const shape = {};
    for (const [name, spec] of Object.entries(s.properties)) {
        let t = spec.type === "integer" || spec.type === "number" ? zod_1.z.number()
            : spec.type === "boolean" ? zod_1.z.boolean()
                : spec.type === "array" ? zod_1.z.array(zod_1.z.any())
                    : spec.type === "object" ? zod_1.z.record(zod_1.z.string(), zod_1.z.any()) : zod_1.z.string();
        if (spec.description)
            t = t.describe(spec.description);
        shape[name] = s.required.includes(name) ? t : t.optional();
    }
    return zod_1.z.object(shape);
}
