import {
  recordsUnionDefaultSchema,
  RecordsUnionSchemaBase,
  RecordsUnionSchemaBaseSkeleton,
  RecordsUnionSchemaOptionsValue,
  SupportedRecordTypes,
} from "./default-records-schema.js";

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
