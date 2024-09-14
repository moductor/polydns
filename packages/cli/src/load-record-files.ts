import { sync as globSync } from "glob";
import { sep } from "path";

export function loadRecordFiles(
  domain: string,
  pattern: string
): {
  path: string;
  name?: string;
}[] {
  const withDomain = pattern.replace("{{domain}}", domain);

  if (!pattern.includes("{{name}}")) {
    return globSync(withDomain).map((path) => ({ path }));
  }

  const regexPattern = withDomain
    .replaceAll("\\", "\\\\")
    .replaceAll(".", "\\.")
    .replace("{{name}}", "(?<name>.+)");
  const regex = new RegExp(`^${regexPattern}$`);

  const globPatternSub = withDomain.replace("{{name}}", "**");

  const pathParts = withDomain.split(sep);
  const nameIndex = pathParts.indexOf("{{name}}");
  if (nameIndex >= 0 && nameIndex < pathParts.length - 1) {
    pathParts.splice(nameIndex, 1);
  }
  const globPatternApex = pathParts.join(sep);

  const resSub = globSync(globPatternSub)
    .map((path) => {
      const match = path.match(regex);
      if (!match || !match.groups) return undefined;
      return {
        path,
        name: match.groups.name?.split("/").reverse().join(".") ?? "",
      };
    })
    .filter((e) => !!e);

  const resApex = globSync(globPatternApex).map((path) => ({
    path,
    name: "",
  }));

  const resSet = new Set([...resApex, ...resSub]);

  return [...resSet];
}
