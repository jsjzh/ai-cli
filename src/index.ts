#!/usr/bin/env node

import inquirer from 'inquirer';
import gitController from './controllers/git';
import gsController from './controllers/gs';
import nodeController from './controllers/node';
import soucheController from './controllers/souche';

async function main() {
  const { command } = await inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: '请选择要执行的命令',
      choices: [
        { name: '1. git - Git 操作', value: 'git' },
        { name: '2. gs - Git SSH 配置管理', value: 'gs' },
        { name: '3. node - Node.js 包管理', value: 'node' },
        { name: '4. souche - Souche 内部工具', value: 'souche' },
      ],
    },
  ]);

  switch (command) {
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
