import inquirer from 'inquirer';
import { exec } from '../../utils/exec';
import { hasGitRepo } from '../../utils/git';
import { commitTypes } from './push';

export default async function initAndPush() {
  try {
    if (hasGitRepo()) {
      console.log('当前项目已有 Git 配置，不能继续执行');
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'remote',
        message: '请输入远端 Git 地址:',
        validate: (v: string) => v.trim().length > 0 || '地址不能为空',
      },
      {
        type: 'input',
        name: 'branch',
        message: '请输入要推送的分支:',
        default: 'master',
      },
      {
        type: 'input',
        name: 'content',
        message: '请输入提交内容:',
        default: 'init project',
      },
      {
        type: 'list',
        name: 'type',
        message: '请选择提交类型:',
        choices: commitTypes,
        default: 'chore',
      },
      {
        type: 'list',
        name: 'scope',
        message: '请选择提交范围:',
        choices: [
          { name: '1. all - 提交所有变更', value: 'all' },
          { name: '2. select - 选择变更文件', value: 'select' },
        ],
        default: 'all',
      },
    ]);

    console.log('正在初始化 Git 仓库...');
    exec('git init', { stdio: 'inherit' });

    exec(`git remote add origin ${answers.remote}`, { stdio: 'inherit' });

    exec(`git checkout -b ${answers.branch}`, { stdio: 'inherit' });

    const remoteHasContent = exec(`git ls-remote --heads origin ${answers.branch}`, { encoding: 'utf8' }).trim().length > 0;
    if (remoteHasContent) {
      console.log('远程仓库已有内容，正在拉取并合并...');
      exec(`git pull origin ${answers.branch} --allow-unrelated-histories`, { stdio: 'inherit' });
    }

    if (answers.scope === 'all') {
      exec('git add .', { stdio: 'inherit' });
    } else {
      const status = exec('git status --porcelain', { encoding: 'utf8' });
      const files = status
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const file = line.trim().split(/\s+/).pop()!;
          return { name: file, value: file, checked: false };
        });

      if (files.length === 0) {
        console.log('没有变更的文件');
        return;
      }

      const { selectedFiles } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedFiles',
          message: '请选择要提交的文件(空格选中, a 全选):',
          choices: files,
        },
      ]);

      if (selectedFiles.length === 0) {
        console.log('未选择任何文件');
        return;
      }

      exec(`git add ${selectedFiles.join(' ')}`, { stdio: 'inherit' });
    }

    const commitMessage = `${answers.type}: ${answers.content}`;
    exec(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    console.log('正在推送...');
    exec(`git push -u origin ${answers.branch}`, { stdio: 'inherit' });

    console.log(`\n推送成功，分支为: ${answers.branch}，提交内容为：${commitMessage}`);
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
