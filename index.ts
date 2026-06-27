#!/usr/bin/env node

import inquirer from 'inquirer';
import gitController from './controllers/git';
import gsController from './controllers/gs';
import nodeController from './controllers/node';

async function main() {
  const { command } = await inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: '请选择要执行的命令',
      choices: [
        { name: 'git - Git 操作', value: 'git' },
        { name: 'gs - Git SSH 配置管理', value: 'gs' },
        { name: 'node - Node.js 包管理', value: 'node' },
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
  }
}

main().catch(console.error);
