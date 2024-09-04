import { z } from "zod";
import {
  recordsUnionDefaultSchema,
  RecordsUnionSchemaBase,
  RecordsUnionSchemaBaseSkeleton,
} from "./default-records-schema.js";

export const recordNameSchema = z
  .string()
  .regex(/^([a-zA-Z0-9]+\.)+([a-zA-Z0-9]+)$/);

export function recordsUnionSchemaWithName<
  T extends RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaBase,
>(schema?: T) {
  return (schema ?? recordsUnionDefaultSchema).and(
    z.object({ name: recordNameSchema })
  );
}

export type RecordsUnionSchemaWithName<
  T extends RecordsUnionSchemaBaseSkeleton = RecordsUnionSchemaBase,
> = ReturnType<typeof recordsUnionSchemaWithName<T>>;
