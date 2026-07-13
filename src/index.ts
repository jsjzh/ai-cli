#!/usr/bin/env node

import inquirer from 'inquirer';
import SearchList from 'inquirer-search-list';
import gitController from './controllers/git';
import gsController from './controllers/gs';
import nodeController from './controllers/node';
import soucheController from './controllers/souche';
import { version } from '../package.json';

inquirer.registerPrompt('search-list', SearchList);

const HELP = `用法: cli [command] [subcommand]

命令:
  git        Git 操作 (push / pull / clone / pullAndMerge / initAndPush / stash / log / status / branch / rebase)
  gs         Git SSH 配置管理 (add / list / test / use / del / current)
  node       Node.js 包管理 (run / install / update / clean)
  souche     内部工具 (sync)

选项:
  --help     显示帮助信息
  --version  显示版本号

示例:
  cli git push              # 直接进入 Git 推送流程
  cli node clean            # 直接进入清除重装流程
  cli git --help            # 查看 Git 子命令帮助
  cli --version             # 查看版本
`;

const GIT_HELP = `Git 操作子命令:
  push         拉取更新，自动判断状态提交并推送
  pull         拉取当前分支最新代码
  clone        克隆仓库（可指定地址 / 分支 / 深度 / 文件夹名）
  pullAndMerge 模糊搜索分支，拉取并合并到当前分支
  initAndPush  初始化仓库，添加远程并推送
  stash        暂存管理（push / pop / list）
  log          查看提交历史
  status       查看工作区状态
  branch       创建或删除分支
  rebase       变基合并

示例:
  cli git push
  cli git log
`;

const GS_HELP = `SSH 配置管理子命令:
  add     新增 SSH 配置
  list    列出所有配置（标记当前使用）
  test    测试 SSH 连接
  use     应用指定配置
  del     删除配置
  current 查看当前 identity

示例:
  cli gs list
  cli gs use
`;

const NODE_HELP = `Node.js 包管理子命令:
  run     列出并执行 package.json scripts
  install 安装依赖
  update  更新依赖
  clean   清除 node_modules 并重装

示例:
  cli node run
  cli node clean
`;

const SOUCHE_HELP = `Souche 内部工具:
  sync    同步依赖到内部 npm 仓库

示例:
  cli souche sync
`;

const COMMAND_HELP: Record<string, string> = {
  git: GIT_HELP,
  gs: GS_HELP,
  node: NODE_HELP,
  souche: SOUCHE_HELP,
};

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`v${version}`);
    return;
  }

  const [command, subcommand] = args;

  if (command) {
    if (subcommand === '--help' || subcommand === '-h') {
      const text = COMMAND_HELP[command];
      if (text) {
        console.log(text);
        return;
      }
      console.log(`未知命令: ${command}\n`);
      console.log(HELP);
      return;
    }

    switch (command) {
      case 'git':
        await gitController(subcommand);
        return;
      case 'gs':
        await gsController(subcommand);
        return;
      case 'node':
        await nodeController(subcommand);
        return;
      case 'souche':
        await soucheController(subcommand);
        return;
      default:
        console.log(`未知命令: ${command}\n`);
        console.log(HELP);
        return;
    }
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    return;
  }

  const { picked } = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'picked',
      message: '请选择要执行的命令',
      choices: [
        { name: '1. git - Git 操作', value: 'git' },
        { name: '2. gs - Git SSH 配置管理', value: 'gs' },
        { name: '3. node - Node.js 包管理', value: 'node' },
        { name: '4. souche - Souche 内部工具', value: 'souche' },
      ],
    },
  ]);

  switch (picked) {
    case 'git':
      await gitController();
      break;
    case 'gs':
      await gsController();
      break;
    case 'node':
      await nodeController();
      break;
    case 'souche':
      await soucheController();
      break;
  }
}

main().catch(console.error);
