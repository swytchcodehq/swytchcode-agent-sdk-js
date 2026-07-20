export interface Tool {
  canonicalId: string;
  name: string;
  description: string;
  inputSchema: { type: string; properties: Record<string,any>; required: string[] };
  execute: (args: Record<string,any>) => Promise<any>;
}

export abstract class Provider {
  abstract formatTool(t: Tool): any | Promise<any>;
  async formatTools(tools: Tool[]): Promise<any[]> {
    return Promise.all(tools.map((t) => this.formatTool(t)));
  }
}
