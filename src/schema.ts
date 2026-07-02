import { z } from "zod";

type JS = { type: string; properties: Record<string, any>; required: string[] };

export function simplify(inputs: any): JS {
  if (Array.isArray(inputs)) {
    const properties: Record<string,any> = {};
    const required: string[] = [];

    for (const item of inputs) {
      if (!item || typeof item !== "object") continue;
      for (const [name, spec] of Object.entries<any>(item)) {
        if (!spec || typeof spec !== "object") continue;

        let t = String(spec.TYPE ?? "STRING").toLowerCase();
        if (t === "int") t = "integer";
        else if (t === "bool") t = "boolean";
        else if (t === "object" || t === "any") t = "object";
        else if (t.startsWith("[]")) t = "array";
        else if (t === "float" || t === "number") t = "number";
        else t = "string";

        properties[name] = { type: t, ...(spec.DESC ? { description: spec.DESC } : {}) };

        const req = spec.REQUIRED;
        const isRequired = req === true || (typeof req === "string" && req.trim().toLowerCase() === "true");
        if (isRequired) required.push(name);
      }
    }
    // Composio-style rule: expose ALL fields to the model and list only the
    // truly-required ones in `required`. A required-only approach hid optional
    // fields — which left all-optional tools (e.g. Stripe) with an empty schema
    // so the model called them with no arguments, and blinded the model to
    // optional fields on tools that do have some required ones.
    return { type:"object", properties, required };
  }
  
  if (!inputs || typeof inputs !== "object") {
    return { type:"object", properties:{}, required:[] };
  }

  const properties = inputs.properties || {};
  let required = inputs.required;
  if (!Array.isArray(required)) {
    required = Object.keys(properties);
  }
  const keep: Record<string, any> = {};

  for (const name of required) {
    let spec = properties[name] || {};
    if (typeof spec === "object" && spec !== null && spec.type === "object" && spec.properties) {
        spec = simplify(spec);
    }
    keep[name] = spec;
  }
  return { type: "object", properties: keep, required: Object.keys(keep) };
}

export function toZod(s: JS) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [name, spec] of Object.entries(s.properties)) {
    let t: z.ZodTypeAny = spec.type === "integer" || spec.type === "number" ? z.number()
      : spec.type === "boolean" ? z.boolean()
      : spec.type === "array" ? z.array(z.any())
      : spec.type === "object" ? z.record(z.string(), z.any()) : z.string();
    if (spec.description) t = t.describe(spec.description);
    shape[name] = s.required.includes(name) ? t : t.optional();
  }
  return z.object(shape);
}
