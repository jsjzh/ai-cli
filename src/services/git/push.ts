import inquirer from 'inquirer';
import pc from 'picocolors';
import { exec, spawn, getErrorMessage } from '../../utils/exec';
import { selectFilesAndStage, getCurrentBranch, commitTypes } from '../../utils/git';

function hasRemoteBranch(branch: string): boolean {
  try {
    const remotes = exec('git branch -r', { encoding: 'utf8' });
    return remotes.split('\n').some((r) => r.trim().replace(/^origin\//, '') === branch);
  } catch {
    return false;
  }
}

export default async function push() {
  try {
    const branch = getCurrentBranch();
    const remoteExists = hasRemoteBranch(branch);

    if (remoteExists) {
      console.log(pc.cyan('▶ 正在拉取远程更新...'));
      try {
        spawn('git', ['pull', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
      } catch {
        console.error(pc.red('✖ 自动合并失败，请手动解决冲突后重试'));
        return;
      }
    } else {
      console.log(pc.yellow('▶ 远程分支不存在，跳过拉取'));
    }

    const status = exec('git status --porcelain', { encoding: 'utf8' });
    const lines = status ? status.split('\n').filter(Boolean) : [];
    const hasStaged = lines.some((l) => l[0] !== ' ' && l[0] !== '?');
    const hasUnstaged = lines.some((l) => l[1] !== ' ');

    if (!hasStaged && !hasUnstaged) {
      console.log(pc.cyan('▶ 没有新的变更，直接推送...'));
      if (remoteExists) {
        const unpushed = exec(`git log origin/${branch}..HEAD --oneline`, {
          encoding: 'utf8',
        }).trim();
        spawn('git', ['push', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
        console.log(pc.green(`\n✔ branch ${branch} 推送成功`));
        if (unpushed) {
          console.log(`包含以下提交:\n${unpushed}`);
        }
      } else {
        spawn('git', ['push', '-u', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
        console.log(pc.green(`\n✔ branch ${branch} 推送成功（新分支，已建立远程跟踪）`));
      }
      return;
    }

    if (hasStaged && !hasUnstaged) {
      console.log(pc.cyan('▶ 检测到已暂存的变更，直接提交推送...'));
      const { content, type } = await inquirer.prompt([
        {
          type: 'input',
          name: 'content',
          message: '请输入提交内容:',
          validate: (input: string) => (input ? true : '提交内容不能为空'),
        },
        {
          type: 'search-list',
          name: 'type',
          message: '请选择提交类型:',
          choices: commitTypes,
          default: 'chore',
        },
      ]);

      const commitMessage = `${type}: ${content}`;
      spawn('git', ['commit', '-m', commitMessage], { stdio: ['ignore', 'inherit', 'inherit'] });
      const pushArgs = remoteExists ? ['push', 'origin', branch] : ['push', '-u', 'origin', branch];
      spawn('git', pushArgs, { stdio: ['ignore', 'inherit', 'inherit'] });
      console.log(pc.green(`\n✔ branch ${branch} 提交成功，提交内容为：${commitMessage}`));
      return;
    }

    const stagedBefore = exec('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'content',
        message: '请输入提交内容:',
        validate: (input: string) => (input ? true : '提交内容不能为空'),
      },
      {
        type: 'search-list',
        name: 'type',
        message: '请选择提交类型:',
        choices: commitTypes,
        default: 'chore',
      },
      {
        type: 'search-list',
        name: 'scope',
        message: '请选择提交范围:',
        choices: [
          { name: '1. all - 提交所有变更', value: 'all' },
          { name: '2. select - 选择变更文件', value: 'select' },
        ],
        default: 'all',
      },
    ]);

    if (answers.scope === 'all') {
      spawn('git', ['add', '.'], { stdio: ['ignore', 'inherit', 'inherit'] });
    } else if (!(await selectFilesAndStage())) {
      return;
    }

    const commitMessage = `${answers.type}: ${answers.content}`;
    try {
      spawn('git', ['commit', '-m', commitMessage], { stdio: ['ignore', 'inherit', 'inherit'] });
    } catch {
      spawn('git', ['reset'], { stdio: ['ignore', 'inherit', 'inherit'] });
      if (stagedBefore.length > 0) {
        spawn('git', ['add', ...stagedBefore], { stdio: ['ignore', 'inherit', 'inherit'] });
      }
      throw new Error(
        `提交失败，已还原暂存状态。原始暂存文件已恢复:\n${stagedBefore.length > 0 ? stagedBefore.map((f) => `  ${f}`).join('\n') : '  (无)'}`,
      );
    }

    const pushArgsEnd = remoteExists ? ['push', 'origin', branch] : ['push', '-u', 'origin', branch];
    spawn('git', pushArgsEnd, { stdio: ['ignore', 'inherit', 'inherit'] });

    console.log(pc.green(`\n✔ branch ${branch} 提交成功，提交内容为：${commitMessage}`));
  } catch (error) {
    console.error(pc.red(`\n✖ 操作失败:`), getErrorMessage(error));
    process.exitCode = 1;
  }
}
