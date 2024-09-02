import { z } from "zod";
import { Prettify } from "../utils/prettify.js";
import {
  recordsUnionDefaultSchema,
  RecordsUnionSchemaBase,
  RecordsUnionSchemaOptionsValue,
  SupportedRecordTypes,
} from "./default-records-schema.js";

export function extendDefaultRecordsUnionSchema<A extends RecordsAdditions>(
  additions?: A
) {
  return z.discriminatedUnion(
    recordsUnionDefaultSchema.discriminator,
    recordsUnionDefaultSchema.options.map((obj) =>
      obj.extend({
        ...(additions?.["global"] ?? {}),
        ...(additions?.[obj.shape.type.value] ?? {}),
      })
    ) as unknown as UnionOptionsSkeleton
  ) as RecordsUnionSchemaExtended<A>;
}

export type RecordsAdditions = Prettify<
  Partial<Record<"global" | SupportedRecordTypes, z.ZodRawShape>>
>;

type UnionDiscriminator = typeof recordsUnionDefaultSchema.discriminator;
type UnionOptionsSkeleton = [
  z.ZodDiscriminatedUnionOption<UnionDiscriminator>,
  ...z.ZodDiscriminatedUnionOption<UnionDiscriminator>[],
];

type RecordMixedAdditions<
  A extends RecordsAdditions,
  T extends SupportedRecordTypes,
> = {
  [K in keyof A["global"]]: A["global"][K];
} & {
  [K in keyof A[T]]: A[T][K];
};

type RecordMixedAdditionsFiltered<
  A extends RecordsAdditions,
  T extends SupportedRecordTypes,
  C = RecordMixedAdditions<A, T>,
> = {
  [K in keyof C as C[K] extends z.ZodTypeAny
    ? K
    : never]: C[K] extends z.ZodTypeAny ? C[K] : never;
};

type RecordObjectSchemaShapeExtended<
  R extends RecordsUnionSchemaOptionsValue,
  A extends RecordsAdditions,
> = R["shape"] & RecordMixedAdditionsFiltered<A, R["shape"]["type"]["value"]>;

type RecordObjectSchemaExtended<
  R extends RecordsUnionSchemaOptionsValue,
  A extends RecordsAdditions,
> = z.ZodObject<RecordObjectSchemaShapeExtended<R, A>>;

type RecordsUnionSchemaOptionsExtended<
  R extends RecordsUnionSchemaOptionsValue[],
  A extends RecordsAdditions,
> = {
  [K in keyof R]: RecordObjectSchemaExtended<R[K], A>;
};

export type RecordsUnionSchemaExtended<
  A extends RecordsAdditions = {},
  U extends RecordsUnionSchemaBase = RecordsUnionSchemaBase,
> = z.ZodDiscriminatedUnion<
  UnionDiscriminator,
  RecordsUnionSchemaOptionsExtended<U["options"], A>
>;
