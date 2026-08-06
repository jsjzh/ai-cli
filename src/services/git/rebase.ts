import inquirer from 'inquirer';
import pc from 'picocolors';
import { exec, spawn, getErrorMessage } from '../../utils/exec';
import { getCurrentBranch } from '../../utils/git';
export default async function rebase() {
  try {
    const currentBranch = getCurrentBranch();

    const branches = exec('git branch --format="%(refname:short)"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((b) => b !== currentBranch);

    if (branches.length === 0) {
      console.log(pc.yellow('没有其他分支可供变基'));
      return;
    }

    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: '请输入目标分支名 (匹配已有分支，或直接输入新分支名)',
        validate: (v: string) => v.trim().length > 0 || '分支名不能为空',
      },
    ]);

    const matched = branches.filter((b) => b.includes(input));
    let targetBranch = input;
    if (matched.length > 0) {
      const { picked } = await inquirer.prompt([
        {
          type: 'search-list',
          name: 'picked',
          message: `匹配到以下分支，请选择:`,
          choices: [
            ...matched,
            new inquirer.Separator(),
            { name: `直接使用 "${input}"`, value: input },
          ],
        },
      ]);
      targetBranch = picked;
    }

    const hasChanges = exec('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
    if (hasChanges) {
      console.log(pc.cyan('▶ 检测到未提交的更改，正在暂存...'));
      spawn('git', ['stash'], { stdio: 'inherit' });
    }

    console.log(pc.cyan(`▶ 正在变基: ${currentBranch} -> ${targetBranch}`));
    spawn('git', ['rebase', targetBranch], { stdio: 'inherit' });

    if (hasChanges) {
      console.log(pc.cyan('▶ 正在恢复暂存的更改...'));
      spawn('git', ['stash', 'pop'], { stdio: 'inherit' });
    }

    console.log(pc.green(`\n✔ 变基完成: ${currentBranch} 已基于 ${targetBranch}`));
  } catch (error) {
    console.error(pc.red(`\n✖ 变基失败:`), getErrorMessage(error));
    process.exitCode = 1;
  }
}
