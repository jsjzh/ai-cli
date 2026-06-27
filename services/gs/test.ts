import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import chalk from 'chalk';

const SSH_DIR = path.join(homedir(), '.ssh');
const GS_CONFIG_PATH = path.join(SSH_DIR, 'gs-config.json');

export default async function test() {
  if (!existsSync(GS_CONFIG_PATH)) {
    console.log('暂无 SSH 配置');
    return;
  }

  const configs = JSON.parse(readFileSync(GS_CONFIG_PATH, 'utf8'));
  const activeConfigs = configs.filter((c: any) => !c.deleteTime);

  if (activeConfigs.length === 0) {
    console.log('暂无 SSH 配置');
    return;
  }

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: '请选择要测试的 SSH 配置(空格选中, a 全选):',
      choices: activeConfigs.map((c: any) => ({
        name: `${c.origin} | ${c.username} | ${c.useremail} | ${c.host} | ${c.keyType}`,
        value: c,
      })),
      default: activeConfigs.map((_: any, i: number) => i),
    },
  ]);

  if (selected.length === 0) {
    console.log('未选择任何配置');
    return;
  }

  for (const config of selected) {
    console.log(chalk.cyan(`\n正在测试 ${config.origin}...`));
    try {
      execSync(`ssh -T ${config.origin}`, {
        encoding: 'utf8',
        timeout: 10000,
        stdio: 'inherit',
      });
      console.log(chalk.green(`\n${config.origin}: 连接成功`));
    } catch (error: any) {
      const output = error.stdout || error.stderr || error.message || '';
      if (
        output.includes('successfully') ||
        output.includes('Hi') ||
        output.includes('Welcome')
      ) {
        console.log(chalk.green(`\n${config.origin}: 连接成功`));
      } else {
        console.log(chalk.red(`\n${config.origin}: 连接失败`));
      }
    }
  }
}
