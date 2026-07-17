import inquirer from 'inquirer';
import clone from '../services/git/clone.js';
import pull from '../services/git/pull.js';
import push from '../services/git/push.js';
import pullAndMerge from '../services/git/pullAndMerge.js';
import initAndPush from '../services/git/initAndPush.js';
import stash from '../services/git/stash.js';
import log from '../services/git/log.js';
import status from '../services/git/status.js';
import branch from '../services/git/branch.js';
import rebase from '../services/git/rebase.js';

export default async function gitController(action?: string) {
  if (!action) {
    const { picked } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'picked',
        message: '请选择 Git 操作',
        choices: [
          { name: '1. push - 提交推送', value: 'push' },
          { name: '2. pull - 拉取更新', value: 'pull' },
          { name: '3. clone - 克隆项目', value: 'clone' },
          { name: '4. pullAndMerge - 拉取并合并分支', value: 'pullAndMerge' },
          { name: '5. initAndPush - 初始化并推送', value: 'initAndPush' },
          { name: '6. stash - 暂存管理', value: 'stash' },
          { name: '7. log - 查看提交历史', value: 'log' },
          { name: '8. status - 查看工作区状态', value: 'status' },
          { name: '9. branch - 分支管理', value: 'branch' },
          { name: '10. rebase - 变基合并', value: 'rebase' },
        ],
      },
    ]);
    action = picked;
  }

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
    case 'stash':
      await stash();
      break;
    case 'log':
      await log();
      break;
    case 'status':
      await status();
      break;
    case 'branch':
      await branch();
      break;
    case 'rebase':
      await rebase();
      break;
    default:
      break;
  }
}
