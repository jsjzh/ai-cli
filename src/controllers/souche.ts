import { createController } from '../utils/controller';
import sync from '../services/souche/sync';
import deploy from '../services/souche/deploy';

export default async function soucheController(action?: string) {
  await createController('请选择 Souche 操作', [
    { name: '1. deploy - 部署当前项目', value: 'deploy' },
    { name: '2. sync - 同步依赖到内部源', value: 'sync' },
  ], action, { deploy, sync });
}
