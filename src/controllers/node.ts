import { createController } from '../utils/controller';
import install from '../services/node/install';
import update from '../services/node/update';
import clean from '../services/node/clean';
import cache from '../services/node/cache';
import run from '../services/node/run';

export default async function nodeController(action?: string) {
  await createController('请选择 Node 操作', [
    { name: '1. run - 运行脚本', value: 'run' },
    { name: '2. install - 安装依赖', value: 'install' },
    { name: '3. update - 更新依赖', value: 'update' },
    { name: '4. clean - 清除并重装依赖', value: 'clean' },
    { name: '5. cache - 清理缓存', value: 'cache' },
  ], action, { run, install, update, clean, cache });
}
