import inquirer from 'inquirer';
import { spawn } from '../../utils/exec.js';
import { detectPackageManager } from '../../utils/node.js';
import fs from 'fs';
import path from 'path';

export default async function run() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log('当前目录未找到 package.json');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const scripts = pkg.scripts;

  if (!scripts || Object.keys(scripts).length === 0) {
    console.log('package.json 中没有定义 scripts');
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

  console.log(`\n> ${pm} ${args.join(' ')}\n`);
  spawn(pm, args, { stdio: 'inherit' });
}
