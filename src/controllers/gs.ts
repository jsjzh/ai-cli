import { createController } from '../utils/controller';
import add from '../services/gs/add';
import list from '../services/gs/list';
import test from '../services/gs/test';
import use from '../services/gs/use';
import del from '../services/gs/del';
import current from '../services/gs/current';

export default async function gsController(action?: string) {
  await createController('请选择 SSH 配置操作', [
    { name: '1. add - 新增 SSH 配置', value: 'add' },
    { name: '2. list - 列出 SSH 配置', value: 'list' },
    { name: '3. test - 测试 SSH 连接', value: 'test' },
    { name: '4. use - 使用 SSH 配置', value: 'use' },
    { name: '5. del - 删除 SSH 配置', value: 'del' },
    { name: '6. current - 查看当前配置', value: 'current' },
  ], action, { add, list, test, use, del, current });
}
