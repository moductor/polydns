import { isDeepStrictEqual } from "util";
import { z } from "zod";
import { Provider } from "./create-provider.js";
import {
  extendDefaultRecordsUnionSchema,
  RecordsAdditions,
} from "./schemas/extend-records-schema.js";
import { ArrayDiff, diffArrays } from "./utils/compare-arrays.js";
import { getDomainFromRecordName } from "./utils/domain-name.js";
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
  const provider = input.provider;

  // create schemas and types

  const recordSchema = extendDefaultRecordsUnionSchema(
    provider?.schemas?.recordsAdditions
  );

  const recordSchemaInternal = recordSchema.and(
    (provider.schemas?.recordIdAddition ??
      z.object({})) as TRecordIdAdditionSchema
  );

  type Record = z.infer<typeof recordSchema>;

  const idKeys = provider.schemas?.recordIdAddition
    ? Object.keys(provider.schemas.recordIdAddition.shape)
    : [];

  // create caller from input

  const caller = provider.createCaller({
    recordSchema,
    recordSchemaInternal,
    config: provider.schemas?.callerConfig ? (input as any).config : undefined,
  });

  // create functions

  async function listDomains() {
    const result = await caller.listDomains();
    if (!result.success) throw new Error();
    return z.array(z.string()).parse(result.data);
  }

  async function listRecordsFull(domain: string) {
    const result = await caller.listRecords(domain);
    if (!result.success) throw new Error();
    return z.array(recordSchemaInternal).parse(result.data);
  }

  function extendRecordWithId(
    record: Record,
    records: Awaited<ReturnType<typeof listRecordsFull>>
  ) {
    if (!provider.schemas?.recordIdAddition) return record;
    return records.find((r) => isDeepStrictEqual(record, omit(r, ...idKeys)));
  }

  async function listRecords(domain: string) {
    return z.array(recordSchema).parse(await listRecordsFull(domain));
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
    const domain = getDomainFromRecordName(record.name!);
    return await deleteRecordWithList(record, await listRecordsFull(domain));
  }

  async function getRecordsChanges(
    domain: string,
    newRecordsSet: Record[],
    currentRecords?: Record[]
  ) {
    const newRecords = z.array(recordSchema).parse(newRecordsSet);
    const records = currentRecords ?? (await listRecordsFull(domain));

    return diffArrays<Record>(
      records.map((r) => omit(r, ...idKeys) as any as Record),
      newRecords
    );
  }

  async function performRecordsChanges(
    domain: string,
    changes: ArrayDiff<Record>,
    currentRecords?: Record[]
  ) {
    const records = currentRecords ?? (await listRecordsFull(domain));

    for (const record of changes.removed) {
      await deleteRecordWithList(record, records);
    }

    for (const record of changes.added) {
      await createRecord(record);
    }
  }

  async function setRecords(domain: string, newRecordsSet: Record[]) {
    const records = await listRecordsFull(domain);

    return await performRecordsChanges(
      domain,
      await getRecordsChanges(domain, newRecordsSet, records),
      records
    );
  }

  return {
    getDomainFromRecordName,
    parseRecord: recordSchema.parse,
    listDomains,
    listRecords,
    createRecord,
    deleteRecord,
    getRecordsChanges,
    performRecordsChanges,
    setRecords,
  };
}
