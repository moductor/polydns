#!/usr/bin/env node

import { Clerc, helpPlugin } from "clerc";
import { version } from "../package.json";
import {
  applyChanges,
  listChanges,
  listCurrentDomains,
  listCurrentRecords,
} from "./list-changes.js";
import { loadConfig } from "./load-config.js";
import { printChanges } from "./print-changes.js";
import { initProvidersForConfig } from "./provider-store.js";

async function getChanges(configFile: string) {
  const config = loadConfig(configFile);

  await initProvidersForConfig(configFile, config);

  const currentDomains = await listCurrentDomains(config);
  const currentRecords = await listCurrentRecords(config, currentDomains);
  const changes = await listChanges(config, currentRecords);

  return changes;
}

Clerc.create()
  .name("PolyDNS")
  .description("PolyDNS")
  .scriptName("polydns")
  .version(version)
  .use(helpPlugin())
  .flag("configFile", "Configuration file", {
    alias: "f",
    type: String,
    default: "./polydns.yaml",
  })
  .command("push", "")
  .command("preview", "")
  .on("push", async ({ flags: { configFile } }) => {
    const changes = await getChanges(configFile);
    printChanges(changes);
    await applyChanges(changes);
  })
  .on("preview", async ({ flags: { configFile } }) => {
    const changes = await getChanges(configFile);
    printChanges(changes);
  })
  .parse();
