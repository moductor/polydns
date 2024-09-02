import { z } from "zod";

export const recordsUnionDefaultSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("A"),
    value: z.string().ip({ version: "v4" }),
  }),
  z.object({
    type: z.literal("AAAA"),
    value: z.string().ip({ version: "v6" }),
  }),
  z.object({
    type: z.literal("CNAME"),
    value: z.string().regex(/^([a-zA-Z0-9]+\.)+$/),
  }),
  z.object({
    type: z.literal("MX"),
    value: z.string().regex(/^([a-zA-Z0-9]+\.)+$/),
    priority: z.number().optional(),
  }),
]) satisfies RecordsUnionSchemaBaseSkeleton;

export type RecordsUnionSchemaBaseSkeleton = z.ZodDiscriminatedUnion<
  string,
  z.ZodObject<
    {
      type: z.ZodLiteral<Uppercase<string>>;
      value: z.ZodString;
    } & z.ZodRawShape
  >[]
>;

export type RecordsUnionSchemaBase = typeof recordsUnionDefaultSchema;

export type RecordsUnionSchemaBaseOptionsValue =
  RecordsUnionSchemaBaseSkeleton["options"][number];

export type RecordsUnionSchemaOptionsValue<
  U extends RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaBase,
> = Extract<U["options"][number], RecordsUnionSchemaBaseOptionsValue>;
