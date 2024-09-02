export type Prettify<T extends Record<PropertyKey, unknown>> = {
  [K in keyof T]: T[K];
} & unknown;
