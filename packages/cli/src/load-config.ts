import { existsSync, readFileSync } from "fs";
import { parse } from "yaml";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { applyEnvVars } from "./apply-environment-variables.js";
import { loadEnvVars } from "./load-environment-variables.js";
import { loadRecordFiles } from "./load-record-files.js";
import out from "./outputs.js";

export const providerSchema = z
  .object({
    name: z.string(),
    module: z.string(),
    config: z.object({}).passthrough().optional(),
  })
  .strict();

export const domainSchemaRaw = z
  .object({
    name: z.string().regex(/^[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/),
    provider: z.string(),
    records: z
      .array(z.union([z.string(), z.object({}).passthrough()]))
      .optional()
      .default([]),
  })
  .strict();

export const domainSchema = domainSchemaRaw.extend({
  records: z.array(z.object({}).passthrough()),
});

export const configSchemaRaw = z
  .object({
    providers: z.array(providerSchema),
    domains: z.array(domainSchemaRaw),
    globalRecords: z
      .array(z.union([z.string(), z.object({}).passthrough()]))
      .optional(),
  })
  .strict();

export const configSchema = configSchemaRaw
  .omit({ globalRecords: true })
  .extend({
    domains: z.array(domainSchema),
  });

export type ConfigRaw = z.infer<typeof configSchemaRaw>;
export type Config = z.infer<typeof configSchema>;

function loadYaml(file: string) {
  try {
    const content = readFileSync(file, { encoding: "utf8" });
    const data = parse(content);
    return data;
  } catch (e) {
    return out.error("Error parsing the config file:\n", (e as any).message, 1);
  }
}

function safeParseYaml(file: string) {
  const { success, data, error } = configSchemaRaw.safeParse(loadYaml(file));

  if (!success) {
    const errorData = fromZodError(error, {
      prefix: "",
      prefixSeparator: "",
      issueSeparator: "\n  ",
    });

    return out.error(
      "Error validating the config file:",
      errorData.toString(),
      1
    );
  }

  return data;
}

function checkProviders(config: ConfigRaw) {
  const providers = config.providers.map((p) => p.name);
  const incorrectProviders: string[] = [];
  const unusedProviders: string[] = [...providers];
  config.domains.forEach((d) =>
    providers.includes(d.provider)
      ? unusedProviders.includes(d.provider)
        ? unusedProviders.splice(unusedProviders.indexOf(d.provider), 1)
        : null
      : incorrectProviders.push(d.provider)
  );

  if (incorrectProviders.length) {
    return out.error("These providers are not defined:", incorrectProviders, 1);
  }

  if (unusedProviders.length) {
    out.warn("These providers are not used:", unusedProviders);
  }
}

function checkDomains(config: ConfigRaw) {
  const domains: string[] = [];
  const duplicateDomains: string[] = [];

  config.domains.forEach((d) => {
    if (domains.includes(d.name)) return duplicateDomains.push(d.name);
    domains.push(d.name);
  });

  if (duplicateDomains.length) {
    return out.error("These domains are duplicate:", duplicateDomains, 1);
  }
}

function safeParseRecordSubFile(path: string) {
  const { success, data, error } = z
    .array(z.object({}).passthrough())
    .safeParse(loadYaml(path) ?? []);

  if (!success) {
    const errorData = fromZodError(error, {
      prefix: "",
      prefixSeparator: "",
      issueSeparator: "\n  ",
    });

    return out.error(
      "Error validating the record config subfile:",
      errorData.toString(),
      1
    );
  }

  return data;
}

function resolveRecordSubfiles(config: ConfigRaw) {
  const { success, data, error } = configSchema.safeParse({
    providers: config.providers,
    domains: config.domains.map((domain) => ({
      ...domain,
      records: [...(config.globalRecords ?? []), ...domain.records].flatMap(
        (record) => {
          if (typeof record != "string") return record;
          return loadRecordFiles(domain.name, record).flatMap(
            ({ path, name }) => {
              const records = safeParseRecordSubFile(path);
              if (name === undefined) return records;
              return records.map((record) => ({
                ...record,
                name,
              }));
            }
          );
        }
      ),
    })),
  });

  if (!success) {
    const errorData = fromZodError(error, {
      prefix: "",
      prefixSeparator: "",
      issueSeparator: "\n  ",
    });

    return out.error(
      "Error validating the config file with record subfiles:",
      errorData.toString(),
      1
    );
  }

  return data;
}

export function loadConfig(file: string) {
  if (!existsSync(file)) {
    return out.error(`The config file at '${file}' doesn't exist!`, [], 1);
  }

  out.log("Loading config file.");
  const config = safeParseYaml(file);

  out.log("Checking duplicates and unused entries.");
  checkProviders(config);
  checkDomains(config);

  out.log("Resolving record subfiles.");
  const resolvedConfig = resolveRecordSubfiles(config);

  loadEnvVars(file);

  out.log("Resolving environment variables.");
  return applyEnvVars(resolvedConfig) satisfies Config;
}
