import { runCli } from "./cli.js";

export function search(intent: string, top = 5): any[] {
  const res = runCli(["discover", intent, "--top", String(top)]) ?? {};
  return res.capabilities ?? [];
}

export function info(canonicalId: string): any {
  try {
    const res = runCli(["info", canonicalId]) ?? {};
    return Array.isArray(res) ? (res[0] ?? {}) : res;   // CLI returns a JSON array
  } catch (e) {
    console.warn(`Warning: Failed to fetch info for ${canonicalId} (${e}). Using empty schema.`);
    return { canonical_id: canonicalId, inputs: {} };
  }
}
