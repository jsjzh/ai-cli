import inquirer from 'inquirer';
import add from '../services/gs/add.js';
import list from '../services/gs/list.js';
import test from '../services/gs/test.js';
import use from '../services/gs/use.js';
import del from '../services/gs/del.js';
import current from '../services/gs/current.js';

export default async function gsController(action?: string) {
  if (!action) {
    const { picked } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'picked',
        message: '请选择 SSH 配置操作',
        choices: [
          { name: '1. add - 新增 SSH 配置', value: 'add' },
          { name: '2. list - 列出 SSH 配置', value: 'list' },
          { name: '3. test - 测试 SSH 连接', value: 'test' },
          { name: '4. use - 使用 SSH 配置', value: 'use' },
          { name: '5. del - 删除 SSH 配置', value: 'del' },
          { name: '6. current - 查看当前配置', value: 'current' },
        ],
      },
    ]);
    action = picked;
  }

  switch (action) {
    case 'add':
      await add();
      break;
    case 'list':
      await list();
      break;
    case 'test':
      await test();
      break;
    case 'use':
      await use();
      break;
    case 'del':
      await del();
      break;
    case 'current':
      await current();
      break;
    default:
      break;
  }
}
