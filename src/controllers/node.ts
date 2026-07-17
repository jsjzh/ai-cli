import inquirer from 'inquirer';
import install from '../services/node/install.js';
import update from '../services/node/update.js';
import clean from '../services/node/clean.js';
import cache from '../services/node/cache.js';
import run from '../services/node/run.js';

export default async function nodeController(action?: string) {
  if (!action) {
    const { picked } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'picked',
        message: '请选择 Node 操作',
        choices: [
          { name: '1. run - 运行脚本', value: 'run' },
          { name: '2. install - 安装依赖', value: 'install' },
          { name: '3. update - 更新依赖', value: 'update' },
          { name: '4. clean - 清除并重装依赖', value: 'clean' },
          { name: '5. cache - 清理缓存', value: 'cache' },
        ],
      },
    ]);
    action = picked;
  }

  switch (action) {
    case 'run':
      await run();
      break;
    case 'install':
      await install();
      break;
    case 'update':
      await update();
      break;
    case 'clean':
      await clean();
      break;
    case 'cache':
      await cache();
      break;
    default:
      break;
  }
}
