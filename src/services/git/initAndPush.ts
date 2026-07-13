import inquirer from 'inquirer';
import { spawn } from '../../utils/exec';
import { hasGitRepo, selectFilesAndStage } from '../../utils/git';
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
        type: 'search-list',
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
    spawn('git', ['init'], { stdio: 'inherit' });

    spawn('git', ['remote', 'add', 'origin', answers.remote], { stdio: 'inherit' });

    spawn('git', ['checkout', '-b', answers.branch], { stdio: 'inherit' });

    const remoteHasContent =
      spawn('git', ['ls-remote', '--heads', 'origin', answers.branch], { encoding: 'utf8' }).trim()
        .length > 0;
    if (remoteHasContent) {
      console.log('远程仓库已有内容，正在拉取并合并...');
      spawn('git', ['pull', 'origin', answers.branch, '--allow-unrelated-histories'], {
        stdio: 'inherit',
      });
    }

    if (answers.scope === 'all') {
      spawn('git', ['add', '.'], { stdio: 'inherit' });
    } else if (!(await selectFilesAndStage())) {
      return;
    }

    const commitMessage = `${answers.type}: ${answers.content}`;
    spawn('git', ['commit', '-m', commitMessage], { stdio: 'inherit' });

    console.log('正在推送...');
    spawn('git', ['push', '-u', 'origin', answers.branch], { stdio: 'inherit' });

    console.log(`\n推送成功，分支为: ${answers.branch}，提交内容为：${commitMessage}`);
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
