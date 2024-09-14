export { createPolyDNS } from "./create-polydns.js";
export {
  createProvider,
  type Provider,
  type ProviderCaller,
  type ProviderCallerMethodResult,
} from "./create-provider.js";
export { type RecordGeneral } from "./schemas/record-schema.js";
export {
  getDomainFromRecordName,
  removeDomainFromName,
} from "./utils/domain-name.js";
