import { runCli } from "./cli.js";

export const add = (libOrUrl: string) => runCli(["add", libOrUrl]) ?? {};
export const listTools = (filter = "") => runCli(filter ? ["list", filter] : ["list"]) ?? {};
export const keys = () => runCli(["key", "list"]) ?? [];
export const policies = () => runCli(["policy", "list"]) ?? [];
export const search = (keyword = "") => runCli(keyword ? ["search", keyword] : ["search"]) ?? {};
