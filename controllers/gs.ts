import inquirer from 'inquirer';
import add from '../services/gs/add';
import list from '../services/gs/list';
import test from '../services/gs/test';
import use from '../services/gs/use';
import del from '../services/gs/del';
import current from '../services/gs/current';

export default async function gsController() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '请选择 SSH 配置操作',
      choices: [
        { name: 'add - 新增 SSH 配置', value: 'add' },
        { name: 'list - 列出 SSH 配置', value: 'list' },
        { name: 'test - 测试 SSH 连接', value: 'test' },
        { name: 'use - 使用 SSH 配置', value: 'use' },
        { name: 'del - 删除 SSH 配置', value: 'del' },
        { name: 'current - 查看当前配置', value: 'current' },
      ],
    },
  ]);

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
  }
}
