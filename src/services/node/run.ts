import inquirer from 'inquirer';
import pc from 'picocolors';
import { spawn } from '../../utils/exec';
import { detectPackageManager, readPackageJson } from '../../utils/node';

export default async function run() {
  const pkg = readPackageJson();
  const scripts = pkg.scripts;

  if (!scripts || Object.keys(scripts).length === 0) {
    console.log(pc.yellow('当前目录未找到 package.json 或未定义 scripts'));
    return;
  }

  const { script } = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'script',
      message: '请选择要执行的脚本:',
      choices: Object.entries(scripts).map(([name, cmd]) => ({
        name: `${name}  →  ${cmd}`,
        value: name,
      })),
    },
  ]);

  const pm = detectPackageManager();
  const args = pm === 'yarn' ? [script] : ['run', script];

  console.log(pc.cyan(`\n▶ ${pm} ${args.join(' ')}\n`));
  spawn(pm, args, { stdio: 'inherit' });
}
