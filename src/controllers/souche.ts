import inquirer from 'inquirer';
import sync from '../services/souche/sync';

export default async function soucheController() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '请选择 Souche 操作',
      choices: [
        { name: '1. sync - 同步依赖到内部源', value: 'sync' },
      ],
    },
  ]);

  switch (action) {
    case 'sync':
      await sync();
      break;
  }
}
