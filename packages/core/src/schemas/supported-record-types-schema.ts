import { z } from "zod";
import {
  recordsUnionDefaultSchema,
  RecordsUnionSchemaBase,
  RecordsUnionSchemaBaseOptionsValue,
} from "./default-records-schema.js";

export const supportedRecordTypesUnionSchema = z.union(
  recordsUnionDefaultSchema.options.map(
    (option) => option.shape.type
  ) as SupportedRecordTypesUnionSchemaOptions
);

export type SupportedRecordTypes = z.infer<
  typeof supportedRecordTypesUnionSchema
>;

type ExtractedRecordTypeSchema<R extends RecordsUnionSchemaBaseOptionsValue> =
  R["shape"]["type"];

type ExtractedRecordTypes<O extends RecordsUnionSchemaBaseOptionsValue[]> = {
  [K in keyof O]: ExtractedRecordTypeSchema<O[K]>;
};

type SupportedRecordTypesUnionSchemaOptions = ExtractedRecordTypes<
  RecordsUnionSchemaBase["options"]
>;
