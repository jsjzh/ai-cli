import inquirer from 'inquirer';
import { exec, spawn } from '../../utils/exec';

export default async function stash() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '请选择暂存操作',
      choices: [
        { name: '1. push - 暂存更改', value: 'push' },
        { name: '2. pop - 恢复暂存', value: 'pop' },
        { name: '3. list - 查看暂存列表', value: 'list' },
      ],
    },
  ]);

  switch (action) {
    case 'push': {
      const { message } = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: '请输入暂存说明(留空则不指定):',
        },
      ]);
      const args = ['stash', 'push'];
      if (message) args.push('-m', message);
      spawn('git', args, { stdio: 'inherit' });
      console.log('\n暂存成功');
      break;
    }
    case 'pop': {
      const list = exec('git stash list', { encoding: 'utf8' }).trim();
      if (!list) {
        console.log('没有暂存的记录');
        return;
      }
      console.log('当前暂存列表:\n');
      console.log(list);
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '是否恢复最近的暂存?',
          default: true,
        },
      ]);
      if (confirm) {
        spawn('git', ['stash', 'pop'], { stdio: 'inherit' });
      }
      break;
    }
    case 'list': {
      const list = exec('git stash list', { encoding: 'utf8' }).trim();
      if (!list) {
        console.log('没有暂存的记录');
        return;
      }
      console.log('\n暂存列表:\n');
      console.log(list);
      break;
    }
  }
}
