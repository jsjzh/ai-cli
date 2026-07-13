import inquirer from 'inquirer';
import { exec, spawn } from '../../utils/exec';

export default async function stash() {
  try {
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

        const lines = list.split('\n');
        const { index } = await inquirer.prompt([
          {
            type: 'search-list',
            name: 'index',
            message: '请选择要恢复的暂存:',
            choices: lines.map((line, i) => ({
              name: line,
              value: i,
            })),
          },
        ]);

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `确定恢复 "stash@{${index}}"?`,
            default: true,
          },
        ]);

        if (confirm) {
          try {
            spawn('git', ['stash', 'pop', `stash@{${index}}`], {
              stdio: 'inherit',
            });
            console.log('\n暂存恢复成功');
          } catch {
            console.error('\n暂存恢复失败，可能存在冲突，请手动处理');
          }
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
  } catch (error) {
    console.error('\n操作失败:', (error as Error).message);
  }
}
