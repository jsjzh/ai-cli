import {
  execSync,
  spawnSync,
  ExecSyncOptions,
  ExecSyncOptionsWithStringEncoding,
  SpawnSyncOptions,
  SpawnSyncOptionsWithStringEncoding,
} from 'child_process';

function timestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
}

export function exec(command: string): Buffer;
export function exec(command: string, options: ExecSyncOptionsWithStringEncoding): string;
export function exec(command: string, options: ExecSyncOptions): Buffer;
export function exec(command: string, options?: ExecSyncOptions): Buffer | string {
  const cwd = options?.cwd ? String(options.cwd) : process.cwd();
  console.log(`「${timestamp()}」: 在 ${cwd} 执行 ${command}`);
  return execSync(command, options as ExecSyncOptions);
}

export function spawn(command: string, args: string[]): Buffer;
export function spawn(
  command: string,
  args: string[],
  options: SpawnSyncOptionsWithStringEncoding,
): string;
export function spawn(command: string, args: string[], options: SpawnSyncOptions): Buffer;
export function spawn(
  command: string,
  args: string[],
  options?: SpawnSyncOptions,
): Buffer | string {
  const cwd = options?.cwd ? String(options.cwd) : process.cwd();
  const shellCmd = [command, ...args.map((a) => (a.includes(' ') ? `"${a}"` : a))].join(' ');
  console.log(`「${timestamp()}」: 在 ${cwd} 执行 ${shellCmd}`);
  const result = spawnSync(command, args, options as SpawnSyncOptions);
  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim();
    const err = new Error(`命令失败: ${shellCmd}${stderr ? `\n${stderr}` : ''}`);
    (err as any).stdout = result.stdout;
    (err as any).stderr = result.stderr;
    (err as any).status = result.status;
    throw err;
  }
  return result.stdout as Buffer | string;
}
