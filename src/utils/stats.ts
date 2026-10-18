import pc from 'picocolors';
import { readAiclirc, writeAiclirc } from './gs-config';

export interface Stats {
  total: number;
  firstAt: string;
  lastAt: string;
  byCommand: Record<string, number>;
}

export function nextStats(
  prev: Partial<Stats> | undefined,
  command: string,
  now: string,
): Stats {
  const byCommand = { ...(prev?.byCommand ?? {}) };
  byCommand[command] = (byCommand[command] ?? 0) + 1;
  return {
    total: (prev?.total ?? 0) + 1,
    firstAt: prev?.firstAt ?? now,
    lastAt: now,
    byCommand,
  };
}

export function bumpStats(command: string): void {
  try {
    const aiclirc = readAiclirc();
    aiclirc.stats = nextStats(
      aiclirc.stats as Partial<Stats> | undefined,
      command,
      new Date().toISOString(),
    );
    writeAiclirc(aiclirc);
  } catch {
    // ponytail: 统计失败静默忽略，绝不影响主命令
  }
}

export function showStats(): void {
  const stats = readAiclirc().stats as Stats | undefined;
  if (!stats || !stats.total) {
    console.log(pc.yellow('暂无调用记录'));
    return;
  }
  console.log(pc.bold(pc.cyan('\n本机调用统计\n')));
  console.log(`  总次数  ${pc.green(String(stats.total))}`);
  console.log(`  首次    ${pc.dim(stats.firstAt)}`);
  console.log(`  最近    ${pc.dim(stats.lastAt)}\n`);
  const rows = Object.entries(stats.byCommand).sort((a, b) => b[1] - a[1]);
  const width = Math.max(...rows.map(([cmd]) => cmd.length));
  for (const [cmd, n] of rows) {
    console.log(`  ${cmd.padEnd(width)}  ${n}`);
  }
}