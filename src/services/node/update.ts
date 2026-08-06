import inquirer from 'inquirer';
import pc from 'picocolors';
import { spawn, getErrorMessage } from '../../utils/exec';
import { detectPackageManager } from '../../utils/node';

export default async function update() {
  const pm = detectPackageManager();

  console.log(pc.cyan(`▶ 检测到包管理器: ${pm}`));

  const { depType } = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'depType',
      message: '请选择要更新的依赖类型:',
      choices: [
        { name: '1. all - 所有依赖', value: 'all' },
        { name: '2. dep - 生产依赖', value: 'dep' },
        { name: '3. devDep - 开发依赖', value: 'devDep' },
      ],
      default: 'all',
    },
  ]);

  const isYarn = pm === 'yarn';
  const args: string[] = isYarn ? ['upgrade'] : ['update'];

  if (depType !== 'all') {
    if (pm === 'npm') {
      args.push(depType === 'dep' ? '--save-prod' : '--save-dev');
    } else if (pm === 'pnpm') {
      args.push(depType === 'dep' ? '--prod' : '--dev');
    }
  }

  try {
    spawn(pm, args, { stdio: 'inherit' });
    console.log(pc.green(`\n✔ 依赖更新完成`));
  } catch (error) {
    console.error(pc.red(`\n✖ 更新失败:`), getErrorMessage(error));
    process.exitCode = 1;
  }
}
