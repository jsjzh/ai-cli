import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { detectPackageManager } from '../../utils/node';

export default async function update() {
  const pm = detectPackageManager();

  const { depType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'depType',
      message: '请选择要更新的依赖类型:',
      choices: [
        { name: 'all - 所有依赖', value: 'all' },
        { name: 'dep - 生产依赖', value: 'dep' },
        { name: 'devDep - 开发依赖', value: 'devDep' },
      ],
      default: 'all',
    },
  ]);

  let updateCmd: string;

  if (pm === 'npm') {
    const flag =
      depType === 'all'
        ? ''
        : `--${depType === 'dep' ? 'save-prod' : 'save-dev'}`;
    updateCmd = `npm update ${flag}`.trim();
  } else if (pm === 'yarn') {
    updateCmd = 'yarn upgrade';
  } else {
    updateCmd = 'pnpm update';
  }

  try {
    console.log(`使用包管理器: ${pm}`);
    execSync(updateCmd, { stdio: 'inherit', encoding: 'utf8' });
    console.log(`\n依赖更新完成`);
  } catch (error) {
    console.error(`\n更新失败:`, (error as Error).message);
  }
}
