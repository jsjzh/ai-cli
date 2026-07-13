import inquirer from 'inquirer';
import install from '../services/node/install';
import update from '../services/node/update';
import clean from '../services/node/clean';
import nvm from '../services/node/nvm';

export default async function nodeController(action?: string) {
  if (!action) {
    const { picked } = await inquirer.prompt([
      {
        type: 'list',
        name: 'picked',
        message: '请选择 Node 操作',
        choices: [
          { name: '1. install - 安装依赖', value: 'install' },
          { name: '2. update - 更新依赖', value: 'update' },
          { name: '3. clean - 清除并重装依赖', value: 'clean' },
          { name: '4. nvm - 切换 Node 版本', value: 'nvm' },
        ],
      },
    ]);
    action = picked;
  }

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
    case 'nvm':
      await nvm();
      break;
    default:
      break;
  }
}
