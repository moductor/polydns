import { createPolyDNS, Provider } from "@polydns/core";
import { z } from "zod";
import { importProvider } from "./import-provider.js";
import { Config, providerSchema } from "./load-config.js";
import out from "./outputs.js";

type PolyDNS = ReturnType<typeof createPolyDNS>;

const providerMap = new Map<string, { dns: PolyDNS; provider: Provider }>();

export async function initProvider(
  configFilePath: string,
  provider: z.infer<typeof providerSchema>
) {
  const providerModule = await importProvider(configFilePath, provider);
  const dns = createPolyDNS({
    provider: providerModule,
    config: providerModule.schemas?.callerConfig ? provider.config : undefined,
  } as any);
  providerMap.set(provider.name, { dns, provider: providerModule });
}

export async function initProvidersForConfig(
  configFilePath: string,
  config: Config
) {
  out.log("Creating providers:");
  for (const provider of config.providers) {
    out.log(undefined, [provider.name]);
    await initProvider(configFilePath, provider);
  }
}

export function getProvider(name: string) {
  return providerMap.get(name);
}
