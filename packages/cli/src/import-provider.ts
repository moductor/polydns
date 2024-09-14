import { Provider } from "@polydns/core";
import { createRequire } from "module";
import { dirname, join, resolve } from "path";
import { z } from "zod";
import { providerSchema } from "./load-config.js";

export const { resolve: resolveModule } = createRequire(import.meta.url);

export function getNodeModulesPath(configFilePath: string) {
  return join(dirname(resolve(configFilePath)), "node_modules");
}

export function resolveProjectModule(
  configFilePath: string,
  moduleName: string
) {
  return resolveModule(moduleName, {
    paths: [getNodeModulesPath(configFilePath)],
  });
}

export async function importProvider(
  configFilePath: string,
  provider: z.infer<typeof providerSchema>
) {
  const modulePath = resolveProjectModule(configFilePath, provider.module);
  const { default: providerModule } = await import(modulePath);
  return providerModule as Provider;
}
