import out from "./outputs.js";

export function applyEnvVars<T>(data: T) {
  if (typeof data == "string") {
    return applyEnvVarsInString(data) as T;
  }

  if (isArray(data)) {
    const array = [...(data as any[])];

    for (let i = 0; i < array.length; i++) {
      array[i] = applyEnvVars(array[i]);
    }

    return array as T;
  }

  if (isObjectLike(data)) {
    const record = { ...(data as Record<string, any>) };

    for (const key of Object.keys(record)) {
      record[key] = applyEnvVars(record[key]);
    }

    return record as T;
  }

  return data as T;
}

function applyEnvVarsInString(value: string) {
  const trimmed = value.trim();

  if (/^env\\\(.+\)$/.test(trimmed)) return value.replace("env\\(", "env(");
  if (!/^env\(.+\)$/.test(trimmed)) return value;

  const envVar = trimmed.substring(4, trimmed.length - 1);
  const envValue = process.env[envVar];

  if (!envValue) {
    out.warn(`Environment variable '${envVar}' was not found.`);
  }

  return envValue;
}

function isObjectLike(value: unknown) {
  return value && typeof value == "object" && !Array.isArray(value);
}

function isArray(value: unknown) {
  return value && typeof value == "object" && Array.isArray(value);
}
