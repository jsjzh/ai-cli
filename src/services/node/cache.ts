import inquirer from 'inquirer';
import pc from 'picocolors';
import { spawn, getErrorMessage } from '../../utils/exec';
import { detectPackageManager } from '../../utils/node';

const cacheCommands: Record<string, string[]> = {
  pnpm: ['store', 'prune'],
  yarn: ['cache', 'clean'],
  npm: ['cache', 'clean', '--force'],
};

export default async function cache() {
  const pm = detectPackageManager();

  console.log(pc.cyan(`▶ 检测到包管理器: ${pm}`));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `将执行 ${pm} ${cacheCommands[pm].join(' ')}，是否继续?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(pc.yellow('✖ 已取消'));
    return;
  }

  try {
    console.log(pc.cyan('▶ 正在清理缓存...'));
    spawn(pm, cacheCommands[pm], { stdio: 'inherit' });
    console.log(pc.green(`\n✔ 缓存清理完成`));
  } catch (error) {
    console.error(pc.red(`\n✖ 缓存清理失败:`), getErrorMessage(error));
  }
}
