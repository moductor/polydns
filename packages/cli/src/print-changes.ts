import { RecordGeneral, removeDomainFromName } from "@polydns/core";
import chalk from "chalk";
import { RecordChanges } from "./list-changes.js";

export function printChanges(changes: RecordChanges) {
  for (const [domain, { changes: recordChanges }] of changes) {
    console.log();
    console.log(chalk.bold.cyan("Domain:"), chalk.bold(domain));

    if (!recordChanges.added.length && !recordChanges.removed.length) {
      console.log("  No changes to be made!");
      continue;
    }

    recordChanges.removed.forEach((record) => {
      console.log(chalk.red("  - DELETE"), recordToString(record));
    });

    recordChanges.added.forEach((record) => {
      console.log(chalk.green("  + CREATE"), recordToString(record));
    });
  }
}

function recordToString(record: RecordGeneral) {
  const nameWithoutDomain = removeDomainFromName(record.name);
  const name = nameWithoutDomain.length ? nameWithoutDomain : "@";
  return `[${name}: ${record.type} "${record.value}"]`;
}
