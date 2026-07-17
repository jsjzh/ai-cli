import inquirer from 'inquirer';
import pc from 'picocolors';
import { exec, spawn } from '../../utils/exec';

export default async function branch() {
  const branches = exec('git branch', { encoding: 'utf8' })
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean);
  const currentBranch = branches.find((b) => b.startsWith('*'))?.replace(/^\*\s*/, '') || '';

  const { action } = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'action',
      message: '请选择分支操作',
      choices: [
        { name: '1. switch - 切换分支', value: 'switch' },
        { name: '2. create - 创建分支', value: 'create' },
        { name: '3. delete - 删除分支', value: 'delete' },
      ],
    },
  ]);

  if (action === 'switch') {
    const others = branches
      .map((b) => b.replace(/^\*\s*/, ''))
      .filter((b) => b !== currentBranch);
    if (others.length === 0) {
      console.log(pc.yellow('没有其他分支可供切换'));
      return;
    }
    const { target } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'target',
        message: '请选择要切换到的分支:',
        choices: others.map((b) => ({ name: b, value: b })),
      },
    ]);
    spawn('git', ['checkout', target], { stdio: 'inherit' });
    console.log(pc.green(`\n✔ 已切换到分支: ${target}`));
    return;
  }

  if (action === 'create') {
    const { name, fromCurrent } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '请输入新分支名称:',
        validate: (v: string) => (v.trim() ? true : '分支名不能为空'),
      },
      {
        type: 'confirm',
        name: 'fromCurrent',
        message: '基于当前分支创建并切换?',
        default: true,
      },
    ]);

    if (fromCurrent) {
      spawn('git', ['checkout', '-b', name], { stdio: 'inherit' });
      console.log(pc.green(`\n✔ 已创建并切换到分支: ${name}`));
    } else {
      spawn('git', ['branch', name], { stdio: 'inherit' });
      console.log(pc.green(`\n✔ 已创建分支: ${name}`));
    }
  } else {
    const branches = exec('git branch', { encoding: 'utf8' })
      .split('\n')
      .map((b) => b.trim().replace(/^\*\s*/, ''))
      .filter(Boolean);

    if (branches.length <= 1) {
      console.log(pc.yellow('没有其他分支可供删除'));
      return;
    }

    const { target } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'target',
        message: '请选择要删除的分支:',
        choices: branches.map((b) => ({ name: b, value: b })),
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确定要删除分支 "${target}"?`,
        default: false,
      },
    ]);

    if (confirm) {
      spawn('git', ['branch', '-D', target], { stdio: 'inherit' });
      console.log(pc.green(`\n✔ 已删除分支: ${target}`));
    }
  }
}
