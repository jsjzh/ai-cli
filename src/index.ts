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
  node       Node.js 包管理 (install / update / clean / nvm)
  souche     内部工具 (sync)

选项:
  --help     显示帮助信息
  --version  显示版本号

示例:
  cli git push              # 直接进入 Git 推送流程
  cli node clean            # 直接进入清除重装流程
  cli --version             # 查看版本
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`v${version}`);
    return;
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    return;
  }

  const [command, subcommand] = args;

  if (command) {
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
