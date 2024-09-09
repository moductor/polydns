export function omit<
  T extends Record<PropertyKey, unknown>,
  C extends keyof T | (string & {}),
>(object: T, ...omittedKeys: C[]) {
  const copy = { ...object };

  for (const key of omittedKeys) {
    if (!Object.hasOwn(copy, key)) continue;
    delete copy[key];
  }

  return copy as Omit<T, (typeof omittedKeys)[number]>;
}
