import inquirer from 'inquirer';
import { exec, spawn } from '../../utils/exec';
import { getCurrentBranch } from './pull';
import Fuse from 'fuse.js';

export default async function rebase() {
  try {
    const currentBranch = getCurrentBranch();

    const branches = exec('git branch --format="%(refname:short)"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((b) => b !== currentBranch);

    if (branches.length === 0) {
      console.log('没有其他分支可供变基');
      return;
    }

    const fuse = new Fuse(branches, { threshold: 0.4 });

    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: '请输入目标分支名 (模糊匹配):',
        validate: (v: string) => v.trim().length > 0 || '分支名不能为空',
      },
    ]);

    const matched = fuse.search(input);
    let targetBranch = input;
    if (matched.length > 0) {
      const matchedNames = matched.map((m) => m.item);
      const { picked } = await inquirer.prompt([
        {
          type: 'list',
          name: 'picked',
          message: `匹配到以下分支，请选择:`,
          choices: [
            ...matchedNames,
            new inquirer.Separator(),
            { name: `直接使用 "${input}"`, value: input },
          ],
        },
      ]);
      targetBranch = picked;
    }

    const hasChanges = exec('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
    if (hasChanges) {
      console.log('检测到未提交的更改，正在暂存...');
      spawn('git', ['stash'], { stdio: 'inherit' });
    }

    console.log(`正在变基: ${currentBranch} -> ${targetBranch}`);
    spawn('git', ['rebase', targetBranch], { stdio: 'inherit' });

    if (hasChanges) {
      console.log('正在恢复暂存的更改...');
      spawn('git', ['stash', 'pop'], { stdio: 'inherit' });
    }

    console.log(`\n变基完成: ${currentBranch} 已基于 ${targetBranch}`);
  } catch (error) {
    console.error(`\n变基失败:`, (error as Error).message);
  }
}
