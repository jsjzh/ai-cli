import inquirer from 'inquirer';
import sync from '../services/souche/sync';
import deploy from '../services/souche/deploy';

export default async function soucheController(action?: string) {
  if (!action) {
    const { picked } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'picked',
        message: '请选择 Souche 操作',
        choices: [
          { name: '1. deploy - 部署当前项目', value: 'deploy' },
          { name: '2. sync - 同步依赖到内部源', value: 'sync' },
        ],
      },
    ]);
    action = picked;
  }

  switch (action) {
    case 'sync':
      await sync();
      break;
    case 'deploy':
      await deploy();
      break;
    default:
      break;
  }
}
