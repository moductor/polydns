import { z } from "zod";
import { RecordsUnionSchemaBaseSkeleton } from "./schemas/default-records-schema.js";
import {
  RecordsAdditions,
  RecordsUnionSchemaExtended,
} from "./schemas/extend-records-schema.js";
import { RecordGeneral } from "./schemas/record-schema.js";
import { PromiseOr } from "./utils/promise-or.js";

export type ProviderCallerMethodResult<TData = undefined> =
  | (TData extends undefined | null | never
      ? {
          success: true;
        }
      : {
          success: true;
          data: TData;
        })
  | {
      success: false;
      error: string;
    };

export type ProviderCaller<
  TRecordsAdditions extends RecordsAdditions = {},
  TRecordIdAdditionSchema extends z.AnyZodObject = z.ZodObject<{}>,
  TRecordsUnionSchema extends
    RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaExtended<TRecordsAdditions>,
  TRecord = RecordGeneral<TRecordsUnionSchema>,
> = {
  listDomains: () => PromiseOr<ProviderCallerMethodResult<string[]>>;
  listRecords: (
    domain: string
  ) => PromiseOr<
    ProviderCallerMethodResult<(TRecord & z.infer<TRecordIdAdditionSchema>)[]>
  >;
  createRecord: (record: TRecord) => PromiseOr<ProviderCallerMethodResult>;
  deleteRecord: (
    record: TRecord & z.infer<TRecordIdAdditionSchema>
  ) => PromiseOr<ProviderCallerMethodResult>;
};

export function createProvider<
  TRecordsAdditions extends RecordsAdditions = {},
  TCallerConfigSchema extends z.AnyZodObject | undefined = undefined,
  TRecordIdAdditionSchema extends z.AnyZodObject = z.ZodObject<{}>,
>(provider: {
  schemas?: {
    recordIdAddition?: TRecordIdAdditionSchema;
    recordsAdditions?: TRecordsAdditions;
    callerConfig?: TCallerConfigSchema;
  };
  createCaller: (
    data: {
      recordSchema: RecordsUnionSchemaExtended<TRecordsAdditions>;
      recordSchemaInternal: z.ZodIntersection<
        RecordsUnionSchemaExtended<TRecordsAdditions>,
        TRecordIdAdditionSchema
      >;
    } & (TCallerConfigSchema extends z.AnyZodObject
      ? { config: z.infer<TCallerConfigSchema> }
      : {})
  ) => ProviderCaller<TRecordsAdditions, TRecordIdAdditionSchema>;
}) {
  return provider;
}

export type Provider<
  TRecordsAdditions extends RecordsAdditions = {},
  TCallerConfigSchema extends z.AnyZodObject | undefined = undefined,
  TRecordIdAdditionSchema extends z.AnyZodObject = z.ZodObject<{}>,
> = ReturnType<
  typeof createProvider<
    TRecordsAdditions,
    TCallerConfigSchema,
    TRecordIdAdditionSchema
  >
>;

export type RecordForCaller<C extends ProviderCaller<any, any, any>> =
  C extends ProviderCaller<infer _, infer _, infer _, infer R> ? R : never;
