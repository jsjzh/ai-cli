import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { getCurrentBranch } from './pull';

export default async function pullAndMerge() {
  try {
    const originalBranch = getCurrentBranch();

    const branches = execSync('git branch --format="%(refname:short)"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(b => b !== originalBranch);

    if (branches.length === 0) {
      console.log('没有其他分支可供合并');
      return;
    }

    const { targetBranch } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetBranch',
        message: '请选择要合并的分支',
        choices: branches,
      },
    ]);

    const hasChanges = execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
    if (hasChanges) {
      console.log('检测到未提交的更改，正在暂存...');
      execSync('git stash', { stdio: 'inherit' });
    }

    console.log(`正在切换到分支: ${targetBranch}`);
    execSync(`git checkout ${targetBranch}`, { stdio: 'inherit' });

    console.log('正在拉取远程更新...');
    execSync(`git pull origin ${targetBranch}`, { stdio: 'inherit' });

    console.log(`正在切换回分支: ${originalBranch}`);
    execSync(`git checkout ${originalBranch}`, { stdio: 'inherit' });

    console.log(`正在合并分支: ${targetBranch}`);
    execSync(`git merge ${targetBranch}`, { stdio: 'inherit' });

    if (hasChanges) {
      console.log('正在恢复暂存的更改...');
      execSync('git stash pop', { stdio: 'inherit' });
    }

    console.log(`\n合并完成！请记得提交代码 (git push origin ${originalBranch})`);
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
