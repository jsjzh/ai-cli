import { exec, spawn } from '../../utils/exec';

export function getCurrentBranch(): string {
  return exec('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

export default async function pull() {
  try {
    const branch = getCurrentBranch();
    console.log(`当前分支: ${branch}`);
    spawn('git', ['pull', 'origin', branch], { stdio: 'inherit' });
    console.log(`\n拉取成功`);
  } catch (error) {
    console.error(`\n拉取失败:`, (error as Error).message);
  }
}
