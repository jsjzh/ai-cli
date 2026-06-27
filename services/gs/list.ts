import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import chalk from 'chalk';

const SSH_DIR = path.join(homedir(), '.ssh');
const GS_CONFIG_PATH = path.join(SSH_DIR, 'gs-config.json');

export default async function list() {
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

  console.log(chalk.cyan('\nSSH 配置列表:\n'));
  console.log(
    chalk.white(
      '  origin         | username        | useremail                  | host            | keyType'
    )
  );
  console.log(chalk.gray('  ' + '-'.repeat(100)));

  activeConfigs.forEach((config: any) => {
    console.log(
      `  ${config.origin.padEnd(15)} | ${config.username.padEnd(15)} | ${config.useremail.padEnd(25)} | ${config.host.padEnd(15)} | ${config.keyType}`
    );
  });
  console.log();
}
