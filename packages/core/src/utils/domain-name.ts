import { recordNameSchema } from "../schemas/default-records-schema.js";

export function getDomainFromRecordName(name: string) {
  const parts = recordNameSchema.parse(name).split(".").reverse();
  return [parts[1], parts[0]].join(".");
}

export function removeDomainFromName(name: string) {
  const parts = recordNameSchema.parse(name).split(".").reverse();
  parts.shift();
  parts.shift();
  return parts.reverse().join(".");
}
