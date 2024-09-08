import {
  createProvider,
  getDomainFromRecordName,
  ProviderCallerMethodResult,
  removeDomainFromName,
} from "polydns";
import { z } from "zod";
import {
  Auth,
  createRecord,
  deleteRecord,
  getAllDomains,
  getRecords,
} from "./api.js";

const callerConfig = z.object({
  publicKey: z.string(),
  secretKey: z.string(),
});

function getAuth(config: z.infer<typeof callerConfig>) {
  const { publicKey: apikey, secretKey: secretapikey } =
    callerConfig.parse(config);
  return { apikey, secretapikey } satisfies Auth;
}

function convertName(name: string) {
  const res = removeDomainFromName(name);
  if (!res.length) return undefined;
  return res;
}

const PorkbunProvider = createProvider({
  schemas: {
    recordIdAddition: z.object({
      id: z.string(),
    }),
    callerConfig,
  },
  createCaller: ({ config, recordSchemaInternal }) => ({
    listDomains: async () => {
      type Res = ProviderCallerMethodResult<string[]>;

      try {
        const res = await getAllDomains(getAuth(config));
        return { success: true, data: res.map((d) => d.domain) } as Res;
      } catch (e) {
        return { success: false, error: e } as Res;
      }
    },
    listRecords: async (domain) => {
      type Res = ProviderCallerMethodResult<
        z.infer<typeof recordSchemaInternal>[]
      >;

      try {
        const res = await getRecords(getAuth(config), domain);
        return {
          success: true,
          data: res.map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            value: ["CNAME", "ALIAS"].includes(r.type)
              ? r.content.endsWith(".")
                ? r.content
                : r.content + "."
              : r.content,
            priority: r.prio ? parseFloat(r.prio) : undefined,
          })),
        } as Res;
      } catch (e) {
        return { success: false, error: e } as Res;
      }
    },
    createRecord: async (record) => {
      try {
        await createRecord(
          getAuth(config),
          getDomainFromRecordName(record.name),
          {
            name: convertName(record.name),
            type: record.type,
            content: record.value,
            prio: (record as any)["priority"],
          }
        );

        return { success: true } as ProviderCallerMethodResult;
      } catch (e) {
        return { success: false, error: e } as ProviderCallerMethodResult;
      }
    },
    deleteRecord: async (record) => {
      try {
        await deleteRecord(
          getAuth(config),
          getDomainFromRecordName(record.name),
          {
            id: record.id,
          }
        );

        return { success: true } as ProviderCallerMethodResult;
      } catch (e) {
        return { success: false, error: e } as ProviderCallerMethodResult;
      }
    },
  }),
});

export default PorkbunProvider;
