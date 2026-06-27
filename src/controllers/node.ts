import inquirer from 'inquirer';
import install from '../services/node/install';
import update from '../services/node/update';
import clean from '../services/node/clean';

export default async function nodeController() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '请选择 Node 操作',
      choices: [
        { name: 'install - 安装依赖', value: 'install' },
        { name: 'update - 更新依赖', value: 'update' },
        { name: 'clean - 清除并重装依赖', value: 'clean' },
      ],
    },
  ]);

  switch (action) {
    case 'install':
      await install();
      break;
    case 'update':
      await update();
      break;
    case 'clean':
      await clean();
      break;
  }
}
