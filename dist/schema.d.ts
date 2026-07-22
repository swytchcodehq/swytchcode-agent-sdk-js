import { z } from "zod";
type JS = {
    type: string;
    properties: Record<string, any>;
    required: string[];
};
export declare function simplify(inputs: any): JS;
export declare function toZod(s: JS): z.ZodObject<{
    [x: string]: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
}, z.core.$strip>;
export {};
