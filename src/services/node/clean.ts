import inquirer from 'inquirer';
import pc from 'picocolors';
import { spawn, getErrorMessage } from '../../utils/exec';
import { existsSync, rmSync } from 'fs';
import { detectPackageManager, lockFiles } from '../../utils/node';

export default async function clean() {
  const pm = detectPackageManager();

  console.log(pc.cyan(`▶ 检测到包管理器: ${pm}`));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '将删除 node_modules 和 lock 文件并重新安装，是否继续?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(pc.yellow('✖ 已取消'));
    return;
  }

  try {
    console.log(pc.cyan('▶ 正在清除 node_modules...'));
    rmSync('node_modules', { recursive: true, force: true });

    const lockFile = lockFiles[pm];
    if (existsSync(lockFile)) {
      rmSync(lockFile);
      console.log(pc.dim(` 已删除 ${lockFile}`));
    }

    console.log(pc.cyan('▶ 正在重新安装依赖...'));
    spawn(pm, ['install'], { stdio: 'inherit' });

    console.log(pc.green(`\n✔ 清除并重装完成`));
  } catch (error) {
    console.error(pc.red(`\n✖ 操作失败:`), getErrorMessage(error));
    process.exitCode = 1;
  }
}
