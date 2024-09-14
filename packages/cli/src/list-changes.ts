import { RecordGeneral } from "@polydns/core";
import { fromZodError } from "zod-validation-error";
import { Config } from "./load-config.js";
import out from "./outputs.js";
import { getProvider } from "./provider-store.js";

function addDomainToRecordName(domain: string, name: string) {
  const parts: string[] = [];
  if (name) parts.push(name);
  parts.push(domain);
  return parts.join(".");
}

function safeParseRecords(
  provider: string,
  records: Config["domains"][number]["records"],
  errors: [Config["domains"][number]["records"][number], string][]
) {
  const schema = getProvider(provider)!.dns.recordSchema;

  return records
    .map((record) => {
      const { success, data, error } = schema.safeParse(record);

      if (!success) {
        const errorData = fromZodError(error, {
          prefix: "",
          prefixSeparator: "",
          issueSeparator: "\n  ",
        });

        errors.push([record, errorData.toString()]);

        return undefined;
      }

      return data;
    })
    .filter((e) => !!e);
}

export async function listCurrentDomains(config: Config) {
  const domainsMap = new Map<string, string[]>();
  out.log("Getting available domains for provider:");
  for (const { name } of config.providers) {
    out.log(undefined, [name]);
    const provider = getProvider(name)!;
    const domains = await provider.dns.listDomains();
    domainsMap.set(name, domains);
  }
  return domainsMap;
}

export type CurrentDomains = Awaited<ReturnType<typeof listCurrentDomains>>;

export async function listCurrentRecords(
  config: Config,
  currentDomains: CurrentDomains
) {
  const notFoundDomains: string[] = [];
  const recordsMap = new Map<string, any>();

  out.log("Getting list of current records for domain:");
  for (const domain of config.domains) {
    const domains = currentDomains.get(domain.provider)!;
    if (!domains.includes(domain.name)) {
      notFoundDomains.push(domain.name);
    }

    if (notFoundDomains.length) continue;

    out.log(undefined, [domain.name]);
    const provider = getProvider(domain.provider)!;
    const records = await provider.dns.listRecords(domain.name);
    recordsMap.set(domain.name, records);
  }

  if (notFoundDomains.length) {
    return out.error(
      "These domains are not managed by set providers:",
      notFoundDomains,
      1
    );
  }

  return recordsMap;
}

export type CurrentRecords = Awaited<ReturnType<typeof listCurrentRecords>>;

export async function listChanges(
  config: Config,
  currentRecords: CurrentRecords
) {
  const errors: Parameters<typeof safeParseRecords>[2] = [];

  out.log("Validating records for domain:");
  const domains = config.domains.map((domain) => {
    out.log(undefined, [domain.name]);
    return {
      ...domain,
      records: safeParseRecords(
        domain.provider,
        domain.records.map((record) => ({
          ...record,
          name: addDomainToRecordName(domain.name, record["name"] as string),
        })),
        errors
      ),
    };
  });

  if (errors.length) {
    errors.forEach(([record, error]) =>
      out.error("Record validation error:", [JSON.stringify(record), error])
    );
    return out.exit(1);
  }

  const changesMap = new Map<
    string,
    {
      provider: string;
      changes: {
        added: RecordGeneral[];
        removed: RecordGeneral[];
      };
    }
  >();

  out.log("Getting record changes for domain:");
  for (const domain of domains) {
    out.log(undefined, [domain.name]);
    const provider = getProvider(domain.provider)!;
    changesMap.set(domain.name, {
      provider: domain.provider,
      changes: await provider.dns.getRecordsChanges(
        domain.name,
        domain.records,
        currentRecords.get(domain.name)
      ),
    });
  }

  return changesMap;
}

export type RecordChanges = Awaited<ReturnType<typeof listChanges>>;

export async function applyChanges(changes: RecordChanges) {
  out.log("Applying record changes for domain:");
  for (const [domain, data] of changes.entries()) {
    out.log(undefined, [domain]);
    const provider = getProvider(data.provider)!;
    await provider.dns.performRecordsChanges(domain, data.changes);
  }
}
