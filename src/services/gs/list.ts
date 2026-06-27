import chalk from 'chalk';
import { getActiveConfigs, GSConfigItem } from '../../utils/gs-config';

export default async function list() {
  const activeConfigs = getActiveConfigs();

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

  activeConfigs.forEach((config: GSConfigItem) => {
    console.log(
      `  ${config.origin.padEnd(15)} | ${config.username.padEnd(15)} | ${config.useremail.padEnd(25)} | ${config.host.padEnd(15)} | ${config.keyType}`
    );
  });
  console.log();
}
