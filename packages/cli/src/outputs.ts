import chalk from "chalk";

const out = {
  error,
  warn,
  log,
  print,
  exit,
};

export default out;

export function error<T extends ExitCode>(
  title?: string,
  details?: string[] | string,
  code?: T
) {
  return print(title, details, code, "Error:", chalk.red, console.error);
}

export function warn<T extends ExitCode>(
  title?: string,
  details?: string[] | string,
  code?: T
) {
  return print(title, details, code, "Warning:", chalk.yellow, console.warn);
}

export function log<T extends ExitCode>(
  title?: string,
  details?: string[] | string,
  code?: T
) {
  return print(title, details, code, "Info:", chalk.blueBright);
}

export function print<T extends ExitCode>(
  title?: string,
  details?: string[] | string,
  code?: T,
  prefix?: string,
  styleFun?: (...text: unknown[]) => string,
  fun = console.log
) {
  if (title) fun();

  const style = (text: string) => (styleFun ? styleFun(text) : text);

  const detailLines = (
    details
      ? typeof details == "string"
        ? details.split("\n")
        : details.flatMap((e) => e.split("\n"))
      : []
  ).map((l) => chalk.reset(l));

  if (title) {
    if (prefix) {
      fun(chalk.bold(style(prefix)), chalk.reset(title));
    } else {
      fun(chalk.bold(style(title)));
    }
  }

  if (detailLines.length) {
    detailLines.forEach((e) => fun(`  ${e}`));
  }

  return exit(code);
}

export function exit<T extends ExitCode>(code?: T) {
  if (typeof code != "number") return undefined as ExitValue<T>;
  return process.exit(code) as ExitValue<T>;
}

type ExitCode = number | undefined;
type ExitValue<TCode extends ExitCode> = TCode extends number
  ? never
  : undefined;
