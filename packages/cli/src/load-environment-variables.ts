import { config } from "dotenv";
import { dirname, join, resolve } from "path";

export function loadEnvVars(configFile: string) {
  const dir = dirname(resolve(configFile));

  const NODE_ENV = process.env.NODE_ENV;
  const paths = [];

  if (NODE_ENV) paths.push(`.env.${NODE_ENV}.local`);
  if (NODE_ENV != "test") paths.push(".env.local");
  if (NODE_ENV) paths.push(`.env.${NODE_ENV}`);
  paths.push(".env");

  config({
    path: paths.map((path) => join(dir, path)),
  });
}
