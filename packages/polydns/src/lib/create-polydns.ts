import { isDeepStrictEqual } from "util";
import { z } from "zod";
import { Provider, ProviderCaller } from "./create-provider.js";
import {
  extendDefaultRecordsUnionSchema,
  RecordsAdditions,
} from "./schemas/extend-records-schema.js";
import { ArrayDiff, diffArrays } from "./utils/compare-arrays.js";
import { omit } from "./utils/omit.js";

type PolyDNSConfig<
  TRecordsAdditions extends RecordsAdditions = {},
  TCallerConfigSchema extends z.AnyZodObject | undefined = undefined,
  TRecordIdAdditionSchema extends z.AnyZodObject = z.ZodObject<{}>,
> = TCallerConfigSchema extends undefined
  ? {
      provider: Provider<
        TRecordsAdditions,
        TCallerConfigSchema,
        TRecordIdAdditionSchema
      >;
    }
  : {
      provider: Provider<
        TRecordsAdditions,
        TCallerConfigSchema,
        TRecordIdAdditionSchema
      >;
      config: z.infer<NonNullable<TCallerConfigSchema>>;
    };

export function createPolyDNS<
  TRecordsAdditions extends RecordsAdditions = {},
  TCallerConfigSchema extends z.AnyZodObject | undefined = undefined,
  TRecordIdAdditionSchema extends z.AnyZodObject = z.ZodObject<{}>,
>(
  input: PolyDNSConfig<
    TRecordsAdditions,
    TCallerConfigSchema,
    TRecordIdAdditionSchema
  >
) {
  // create caller from input

  const provider = input.provider;

  function getCaller() {
    const config = !provider.schemas?.callerConfig
      ? undefined
      : (
          input as {
            config: z.infer<NonNullable<TCallerConfigSchema>>;
          }
        ).config;

    return (
      config
        ? provider.createCaller(provider.schemas!.callerConfig!.parse(config))
        : (provider as any).createCaller()
    ) as ProviderCaller<TRecordsAdditions>;
  }

  const caller = getCaller();

  // create schemas and types

  const recordSchema = extendDefaultRecordsUnionSchema(
    provider?.schemas?.recordsAdditions
  );

  type Record = z.infer<typeof recordSchema>;

  const idKeys = provider.schemas?.recordIdAddition
    ? Object.keys(provider.schemas.recordIdAddition.shape)
    : [];

  // create functions

  async function listRecordsFull() {
    const result = await caller.listRecords();
    if (!result.success) throw new Error();
    return result.data;
  }

  function extendRecordWithId(
    record: Record,
    records: Awaited<ReturnType<typeof listRecordsFull>>
  ) {
    if (!provider.schemas?.recordIdAddition) return record;
    return records.find((r) => isDeepStrictEqual(record, omit(r, ...idKeys)));
  }

  async function listRecords() {
    return z.array(recordSchema).parse(await listRecordsFull());
  }

  async function createRecord(record: Record) {
    const result = await caller.createRecord(recordSchema.parse(record));
    if (!result.success) throw new Error();
  }

  async function deleteRecordWithList(
    record: Record,
    records: Parameters<typeof extendRecordWithId>[1]
  ) {
    const fullRecord = extendRecordWithId(recordSchema.parse(record), records);
    if (!fullRecord) return;

    const result = await caller.deleteRecord(fullRecord);
    if (!result.success) throw new Error();
  }

  async function deleteRecord(record: Record) {
    return await deleteRecordWithList(record, await listRecordsFull());
  }

  async function getRecordsChanges(newRecordsSet: Record[]) {
    const newRecords = z.array(recordSchema).parse(newRecordsSet);
    const currentRecords = await listRecordsFull();

    return diffArrays<Record>(
      currentRecords.map((r) => omit(r, ...idKeys) as any as Record),
      newRecords
    );
  }

  async function performRecordsChanges(changes: ArrayDiff<Record>) {
    const currentRecords = await listRecordsFull();

    for (const record of changes.removed) {
      await deleteRecordWithList(record, currentRecords);
    }

    for (const record of changes.added) {
      await createRecord(record);
    }
  }

  async function setRecords(newRecordsSet: Record[]) {
    return await performRecordsChanges(await getRecordsChanges(newRecordsSet));
  }

  return {
    parseRecord: recordSchema.parse,
    listRecords,
    createRecord,
    deleteRecord,
    getRecordsChanges,
    performRecordsChanges,
    setRecords,
  };
}
