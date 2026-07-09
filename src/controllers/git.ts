import inquirer from 'inquirer';
import clone from '../services/git/clone';
import pull from '../services/git/pull';
import push from '../services/git/push';
import pullAndMerge from '../services/git/pullAndMerge';
import initAndPush from '../services/git/initAndPush';

export default async function gitController() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '请选择 Git 操作',
      choices: [
        { name: '1. push - 提交推送', value: 'push' },
        { name: '2. pull - 拉取更新', value: 'pull' },
        { name: '3. clone - 克隆项目', value: 'clone' },
        { name: '4. pullAndMerge - 拉取并合并分支', value: 'pullAndMerge' },
        { name: '5. initAndPush - 初始化并推送', value: 'initAndPush' },
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
    case 'pullAndMerge':
      await pullAndMerge();
      break;
    case 'initAndPush':
      await initAndPush();
      break;
  }
}
