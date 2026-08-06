import { existsSync } from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import pc from 'picocolors';
import { exec, spawn, getErrorMessage } from './exec';

export type HookPhase = 'pre' | 'post';

interface HookOptions {
  cwd?: string;
  phase?: HookPhase;
}

export function getProjectRoot(cwd?: string): string | null {
  try {
    return exec('git rev-parse --show-toplevel', { encoding: 'utf8', cwd: cwd || process.cwd() }).trim();
  } catch {
    return null;
  }
}

export function getHookPath(root: string, hookName: string, phase: HookPhase): string | null {
  const hookPath = path.join(root, '.clihooks', `${phase}-${hookName}`);
  return existsSync(hookPath) ? hookPath : null;
}

async function confirmRun(hookPath: string): Promise<boolean> {
  const { shouldRun } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldRun',
      message: `发现项目 hook: ${hookPath}\n是否执行?`,
      default: true,
    },
  ]);
  return shouldRun;
}

async function runOneHook(root: string, hookName: string, phase: HookPhase): Promise<void> {
  const hookPath = getHookPath(root, hookName, phase);
  if (!hookPath) return;

  const confirmed = await confirmRun(hookPath);
  if (!confirmed) {
    console.log(pc.yellow(`已跳过 hook: ${hookPath}`));
    return;
  }

  console.log(pc.cyan(`▶ 执行 hook: ${hookPath}`));
  try {
    spawn(process.execPath, [hookPath], { stdio: ['ignore', 'inherit', 'inherit'] });
    console.log(pc.green('✔ hook 执行成功'));
  } catch (error) {
    console.error(pc.red(`✖ hook 执行失败: ${hookPath}`), getErrorMessage(error));
  }
}

export async function runHooks(hookName: string, options?: HookOptions): Promise<void> {
  const cwd = options?.cwd || process.cwd();
  const root = getProjectRoot(cwd);
  if (!root) return;

  const phase = options?.phase;
  if (!phase || phase === 'pre') {
    await runOneHook(root, hookName, 'pre');
  }
  if (!phase || phase === 'post') {
    await runOneHook(root, hookName, 'post');
  }
}
