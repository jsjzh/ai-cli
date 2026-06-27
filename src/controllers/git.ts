import inquirer from 'inquirer';
import clone from '../services/git/clone';
import pull from '../services/git/pull';
import push from '../services/git/push';

export default async function gitController() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '请选择 Git 操作',
      choices: [
        { name: 'clone - 克隆项目', value: 'clone' },
        { name: 'pull - 拉取更新', value: 'pull' },
        { name: 'push - 提交推送', value: 'push' },
      ],
    },
  ]);

  switch (action) {
    case 'clone':
      await clone();
      break;
    case 'pull':
      await pull();
      break;
    case 'push':
      await push();
      break;
  }
}
