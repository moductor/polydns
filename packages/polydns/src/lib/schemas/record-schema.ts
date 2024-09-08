import { z } from "zod";
import {
  recordsUnionDefaultSchema,
  RecordsUnionSchemaBase,
  RecordsUnionSchemaBaseSkeleton,
  RecordsUnionSchemaOptionsValue,
} from "./default-records-schema.js";
import { SupportedRecordTypes } from "./supported-record-types-schema.js";

export function getRecordSchema<
  T extends SupportedRecordTypes,
  U extends RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaBase,
>(recordType: T, recordsUnion?: U) {
  return (recordsUnion ?? recordsUnionDefaultSchema).options.find(
    (option) => option.shape.type.value == recordType
  ) as RecordSchema<T, U>;
}

export type RecordSchema<
  T extends SupportedRecordTypes,
  U extends RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaBase,
> = Extract<
  RecordsUnionSchemaOptionsValue<U>,
  { shape: { type: { value: T } } }
>;

export type RecordGeneral<
  U extends RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaBase,
> = z.infer<U>;

export type Record<
  T extends SupportedRecordTypes,
  U extends RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaBase,
> = Extract<RecordGeneral<U>, { type: T }>;
