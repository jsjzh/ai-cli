import { execSync } from 'child_process';

export interface CommandInfo {
  name: string;
  description: string;
  supported: boolean;
  run: () => Promise<string>;
}

export interface CommandGroup {
  id: string;
  name: string;
  commands: CommandInfo[];
}

function execSimple(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8' }).toString().trim();
}

function captureConsole(fn: () => Promise<void>): Promise<string> {
  const chunks: string[] = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...args: any) => chunks.push(args.map(String).join(' '));
  console.error = (...args: any) => chunks.push(args.map(String).join(' '));
  return fn().finally(() => {
    console.log = origLog;
    console.error = origErr;
  }).then(() => chunks.join('\n'));
}

const gitCommands: CommandInfo[] = [
  {
    name: 'push',
    description: '提交推送',
    supported: true,
    async run() {
      const branch = execSimple('git rev-parse --abbrev-ref HEAD');
      const status = execSimple('git status --porcelain');
      if (!status) {
        execSync(`git push origin ${branch}`, { encoding: 'utf8', stdio: 'pipe' });
        return `branch ${branch} 推送成功`;
      }
      return '检测到未提交的变更。请使用终端模式: cli git push';
    },
  },
  {
    name: 'pull',
    description: '拉取更新',
    supported: true,
    async run() {
      const branch = execSimple('git rev-parse --abbrev-ref HEAD');
      const output = execSimple(`git pull origin ${branch}`);
      return `当前分支: ${branch}\n${output}\n拉取成功`;
    },
  },
  {
    name: 'status',
    description: '查看工作区状态',
    supported: true,
    async run() {
      return execSimple('git status');
    },
  },
  {
    name: 'log',
    description: '查看提交历史',
    supported: true,
    async run() {
      const output = execSimple('git log --oneline --graph --decorate -20');
      return `最近的 20 条提交:\n\n${output}`;
    },
  },
  {
    name: 'clone',
    description: '克隆项目',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli git clone'); },
  },
  {
    name: 'pullAndMerge',
    description: '拉取并合并分支',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli git pullAndMerge'); },
  },
  {
    name: 'initAndPush',
    description: '初始化并推送',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli git initAndPush'); },
  },
  {
    name: 'stash',
    description: '暂存管理',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli git stash'); },
  },
  {
    name: 'branch',
    description: '分支管理',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli git branch'); },
  },
  {
    name: 'rebase',
    description: '变基合并',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli git rebase'); },
  },
];

const gsCommands: CommandInfo[] = [
  {
    name: 'list',
    description: '列出 SSH 配置',
    supported: true,
    async run() {
      return captureConsole(async () => {
        const mod = await import('../services/gs/list.js');
        await mod.default();
      });
    },
  },
  {
    name: 'current',
    description: '查看当前配置',
    supported: true,
    async run() {
      return captureConsole(async () => {
        const mod = await import('../services/gs/current.js');
        await mod.default();
      });
    },
  },
  {
    name: 'add',
    description: '新增 SSH 配置',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli gs add'); },
  },
  {
    name: 'test',
    description: '测试 SSH 连接',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli gs test'); },
  },
  {
    name: 'use',
    description: '使用 SSH 配置',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli gs use'); },
  },
  {
    name: 'del',
    description: '删除 SSH 配置',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli gs del'); },
  },
];

const nodeCommands: CommandInfo[] = [
  {
    name: 'install',
    description: '安装依赖',
    supported: true,
    async run() {
      return captureConsole(async () => {
        const mod = await import('../services/node/install.js');
        await mod.default();
      });
    },
  },
  {
    name: 'run',
    description: '运行脚本',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli node run'); },
  },
  {
    name: 'update',
    description: '更新依赖',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli node update'); },
  },
  {
    name: 'clean',
    description: '清除并重装依赖',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli node clean'); },
  },
  {
    name: 'cache',
    description: '清理缓存',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli node cache'); },
  },
];

const soucheCommands: CommandInfo[] = [
  {
    name: 'sync',
    description: '同步依赖到内部源',
    supported: true,
    async run() {
      return captureConsole(async () => {
        const mod = await import('../services/souche/sync.js');
        await mod.default();
      });
    },
  },
  {
    name: 'deploy',
    description: '部署当前项目',
    supported: false,
    run: async () => { throw new Error('请使用终端模式: cli souche deploy'); },
  },
];

export const commandGroups: CommandGroup[] = [
  { id: 'git', name: 'Git 操作', commands: gitCommands },
  { id: 'gs', name: 'Git SSH 配置管理', commands: gsCommands },
  { id: 'node', name: 'Node.js 包管理', commands: nodeCommands },
  { id: 'souche', name: 'Souche 内部工具', commands: soucheCommands },
];

export function findGroup(id: string): CommandGroup | undefined {
  return commandGroups.find((g) => g.id === id);
}

export function findCommand(groupId: string, commandName: string): CommandInfo | undefined {
  const group = findGroup(groupId);
  if (!group) return undefined;
  return group.commands.find((c) => c.name === commandName);
}
