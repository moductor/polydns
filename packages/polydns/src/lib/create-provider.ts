import { z } from "zod";
import { RecordsUnionSchemaBaseSkeleton } from "./schemas/default-records-schema.js";
import {
  RecordsAdditions,
  RecordsUnionSchemaExtended,
} from "./schemas/extend-records-schema.js";
import { RecordsUnionSchemaWithName } from "./schemas/records-schema-with-name.js";
import { PromiseOr } from "./utils/promise-or.js";

type CallerMethodResult<TData = undefined> =
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

type CallerConfig<
  TRecordsAdditions extends RecordsAdditions,
  TRecordsUnionSchema extends
    RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaExtended<TRecordsAdditions>,
> = {
  listRecords: () => PromiseOr<
    CallerMethodResult<
      z.infer<RecordsUnionSchemaWithName<TRecordsUnionSchema>>[]
    >
  >;
  createRecord: (
    record: z.infer<RecordsUnionSchemaWithName<TRecordsUnionSchema>>
  ) => PromiseOr<CallerMethodResult>;
  deleteRecord: (
    record: z.infer<RecordsUnionSchemaWithName<TRecordsUnionSchema>>
  ) => PromiseOr<CallerMethodResult>;
};

export function createProvider<
  TRecordsAdditions extends RecordsAdditions = {},
  TCallerConfigSchema extends z.AnyZodObject | undefined = undefined,
>(provider: {
  schemas: {
    recordsAdditions?: TRecordsAdditions;
    callerConfig?: TCallerConfigSchema;
  };
  createCaller: TCallerConfigSchema extends undefined
    ? () => CallerConfig<TRecordsAdditions>
    : (
        config: z.infer<NonNullable<TCallerConfigSchema>>
      ) => CallerConfig<TRecordsAdditions>;
}) {
  return provider;
}
