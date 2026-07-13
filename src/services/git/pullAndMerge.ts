import inquirer from 'inquirer';
import { exec, spawn } from '../../utils/exec';
import { getCurrentBranch } from './pull';
import Fuse from 'fuse.js';

export default async function pullAndMerge() {
  try {
    const originalBranch = getCurrentBranch();

    const branches = exec('git branch --format="%(refname:short)"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((b) => b !== originalBranch);

    if (branches.length === 0) {
      console.log('没有其他分支可供合并');
      return;
    }

    const fuse = new Fuse(branches, { threshold: 0.4 });

    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: '请输入分支名 (模糊匹配已有分支，或直接输入新分支名)',
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
          message: `"${input}" 匹配到以下分支，请选择:`,
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
    let stashed = false;
    if (hasChanges) {
      console.log('检测到未提交的更改，正在暂存...');
      spawn('git', ['stash'], { stdio: 'inherit' });
      stashed = true;
    }

    try {
      console.log(`正在切换到分支: ${targetBranch}`);
      spawn('git', ['checkout', targetBranch], { stdio: 'inherit' });

      console.log('正在拉取远程更新...');
      spawn('git', ['pull', 'origin', targetBranch], { stdio: 'inherit' });

      console.log(`正在切换回分支: ${originalBranch}`);
      spawn('git', ['checkout', originalBranch], { stdio: 'inherit' });

      console.log(`正在合并分支: ${targetBranch}`);
      const headBefore = exec('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      spawn('git', ['merge', targetBranch], { stdio: 'inherit' });
      const headAfter = exec('git rev-parse HEAD', { encoding: 'utf8' }).trim();

      if (headBefore === headAfter) {
        console.log('没有需要合并的内容');
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
        console.log('正在推送...');
        spawn('git', ['push', 'origin', originalBranch], { stdio: 'inherit' });
        console.log('推送成功');
      } else {
        console.log(`请记得推送提交 (git push origin ${originalBranch})`);
      }
    } catch (error) {
      console.error('操作中断，尝试切回原分支...');
      try {
        spawn('git', ['checkout', originalBranch], { stdio: 'inherit' });
      } catch {
        // ignore checkout failure
      }
      throw error;
    } finally {
      if (stashed) {
        console.log('正在恢复暂存的更改...');
        spawn('git', ['stash', 'pop'], { stdio: 'inherit' });
      }
    }
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
