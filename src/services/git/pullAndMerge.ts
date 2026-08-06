import inquirer from 'inquirer';
import pc from 'picocolors';
import { exec, spawn, getErrorMessage } from '../../utils/exec';
import { getCurrentBranch } from '../../utils/git';
export default async function pullAndMerge() {
  try {
    const originalBranch = getCurrentBranch();

    const branches = exec('git branch --format="%(refname:short)"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((b) => b !== originalBranch);

    if (branches.length === 0) {
      console.log(pc.yellow('没有其他分支可供合并'));
      return;
    }

    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: '请输入分支名 (匹配已有分支，或直接输入新分支名)',
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
          message: `"${input}" 匹配到以下分支，请选择:`,
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
    let stashed = false;
    if (hasChanges) {
      console.log(pc.cyan('▶ 检测到未提交的更改，正在暂存...'));
      spawn('git', ['stash'], { stdio: 'inherit' });
      stashed = true;
    }

    try {
      console.log(pc.cyan(`▶ 正在切换到分支: ${targetBranch}`));
      spawn('git', ['checkout', targetBranch], { stdio: 'inherit' });

      console.log(pc.cyan('▶ 正在拉取远程更新...'));
      spawn('git', ['pull', 'origin', targetBranch], { stdio: 'inherit' });

      console.log(pc.cyan(`▶ 正在切换回分支: ${originalBranch}`));
      spawn('git', ['checkout', originalBranch], { stdio: 'inherit' });

      console.log(pc.cyan(`▶ 正在合并分支: ${targetBranch}`));
      const headBefore = exec('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      spawn('git', ['merge', targetBranch], { stdio: 'inherit' });
      const headAfter = exec('git rev-parse HEAD', { encoding: 'utf8' }).trim();

      if (headBefore === headAfter) {
        console.log(pc.yellow('没有需要合并的内容'));
        return;
      }

      const { shouldPush } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldPush',
          message: '是否立即推送提交?',
          default: true,
        },
      ]);

      if (shouldPush) {
        console.log(pc.cyan('▶ 正在推送...'));
        spawn('git', ['push', 'origin', originalBranch], { stdio: 'inherit' });
        console.log(pc.green('✔ 推送成功'));
      } else {
        console.log(pc.yellow(`请记得推送提交 (git push origin ${originalBranch})`));
      }
    } catch (error) {
      console.error('操作中断，尝试切回原分支...');
      try {
        spawn('git', ['checkout', originalBranch], { stdio: 'inherit' });
      } catch (err) {
        console.error('切回原分支失败:', getErrorMessage(err));
      }
      throw error;
    } finally {
      if (stashed) {
        console.log(pc.cyan('▶ 正在恢复暂存的更改...'));
        spawn('git', ['stash', 'pop'], { stdio: 'inherit' });
      }
    }
  } catch (error) {
    console.error(pc.red('\n✖ 操作失败:'), getErrorMessage(error));
    process.exitCode = 1;
  }
}
