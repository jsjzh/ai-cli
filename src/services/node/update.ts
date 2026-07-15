import inquirer from 'inquirer';
import { spawn } from '../../utils/exec';
import { detectPackageManager } from '../../utils/node';

export default async function update() {
  const pm = detectPackageManager();

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
    console.log(`使用包管理器: ${pm}`);
    spawn(pm, args, { stdio: 'inherit' });
    console.log(`\n依赖更新完成`);
  } catch (error) {
    console.error(`\n更新失败:`, (error as Error).message);
  }
}
