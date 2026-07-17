import inquirer from 'inquirer';
import { spawn } from '../../utils/exec.js';
import { existsSync, rmSync } from 'fs';
import { detectPackageManager, lockFiles } from '../../utils/node.js';

export default async function clean() {
  const pm = detectPackageManager();

  console.log(`检测到包管理器: ${pm}`);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '将删除 node_modules 和 lock 文件并重新安装，是否继续?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log('已取消');
    return;
  }

  try {
    console.log('正在清除 node_modules...');
    rmSync('node_modules', { recursive: true, force: true });

    const lockFile = lockFiles[pm];
    if (existsSync(lockFile)) {
      rmSync(lockFile);
      console.log(`已删除 ${lockFile}`);
    }

    console.log('正在重新安装依赖...');
    spawn(pm, ['install'], { stdio: 'inherit' });

    console.log(`\n清除并重装完成`);
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
