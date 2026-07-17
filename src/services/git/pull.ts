import pc from 'picocolors';
import { exec, spawn, getErrorMessage } from '../../utils/exec';

export function getCurrentBranch(): string {
  return exec('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

export default async function pull() {
  try {
    const branch = getCurrentBranch();
    console.log(pc.cyan(`▶ 当前分支: ${branch}，正在拉取...`));
    spawn('git', ['pull', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
    console.log(pc.green(`✔ 拉取成功`));
  } catch (error) {
    console.error(pc.red(`✖ 拉取失败:`), getErrorMessage(error));
  }
}
