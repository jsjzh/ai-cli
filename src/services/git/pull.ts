import pc from 'picocolors';
import { exec, spawn, getErrorMessage } from '../../utils/exec';
import { runHooks } from '../../utils/hook';

export function getCurrentBranch(): string {
  return exec('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

export default async function pull() {
  try {
    await runHooks('git-pull', { phase: 'pre' });

    const branch = getCurrentBranch();
    console.log(pc.cyan(`▶ 当前分支: ${branch}，正在拉取...`));
    spawn('git', ['pull', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
    console.log(pc.green(`✔ 拉取成功`));

    await runHooks('git-pull', { phase: 'post' });
  } catch (error) {
    console.error(pc.red(`✖ 拉取失败:`), getErrorMessage(error));
  }
}
