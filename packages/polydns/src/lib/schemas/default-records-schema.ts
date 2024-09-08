import { z } from "zod";

function dnsRecord<
  Type extends string,
  Props extends {
    value: z.ZodString;
    [prop: string]: z.ZodType;
  },
>(type: Type, props: Props) {
  return z.object({
    name: z.string().regex(/^([a-zA-Z0-9]+\.)+([a-zA-Z0-9]+)$/),
    type: z.literal(type),
    ...props,
  });
}

export const recordsUnionDefaultSchema = z.discriminatedUnion("type", [
  dnsRecord("A", {
    value: z.string().ip({ version: "v4" }),
  }),
  dnsRecord("AAAA", {
    value: z.string().ip({ version: "v6" }),
  }),
  dnsRecord("CNAME", {
    value: z.string().regex(/^([a-zA-Z0-9]+\.)+$/),
  }),
  dnsRecord("MX", {
    value: z.string().regex(/^([a-zA-Z0-9]+\.)+$/),
    priority: z.number().optional(),
  }),
]) satisfies RecordsUnionSchemaBaseSkeleton;

export type RecordsUnionSchemaBaseSkeleton = z.ZodDiscriminatedUnion<
  string,
  z.ZodObject<
    {
      name: z.ZodString;
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
