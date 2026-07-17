import { createController } from '../utils/controller';
import clone from '../services/git/clone';
import pull from '../services/git/pull';
import push from '../services/git/push';
import pullAndMerge from '../services/git/pullAndMerge';
import initAndPush from '../services/git/initAndPush';
import stash from '../services/git/stash';
import log from '../services/git/log';
import status from '../services/git/status';
import branch from '../services/git/branch';
import rebase from '../services/git/rebase';

export default async function gitController(action?: string) {
  await createController('请选择 Git 操作', [
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
  ], action, { clone, pull, push, pullAndMerge, initAndPush, stash, log, status, branch, rebase });
}
