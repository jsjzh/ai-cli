import {
  execSync,
  ExecSyncOptions,
  ExecSyncOptionsWithStringEncoding,
} from "child_process";

export function exec(command: string): Buffer;
export function exec(
  command: string,
  options: ExecSyncOptionsWithStringEncoding,
): string;
export function exec(command: string, options: ExecSyncOptions): Buffer;
export function exec(
  command: string,
  options?: ExecSyncOptions,
): Buffer | string {
  const cwd = options?.cwd ? String(options.cwd) : process.cwd();
  const now = new Date();
  const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
  console.log(`「${time}」: 在 ${cwd} 执行 ${command}`);
  return execSync(command, options as ExecSyncOptions);
}
