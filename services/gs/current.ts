import { execSync } from 'child_process';
import chalk from 'chalk';
import { getActiveConfigs, GSConfigItem } from '../../utils/gs-config';
import { hasGitRepo } from '../../utils/git';

export default async function current() {
  const scope = hasGitRepo() ? 'local' : 'global';
  const scopeFlag = hasGitRepo() ? '--local' : '--global';

  try {
    const name = execSync(`git config ${scopeFlag} user.name`, {
      encoding: 'utf8',
    }).trim();
    const email = execSync(`git config ${scopeFlag} user.email`, {
      encoding: 'utf8',
    }).trim();

    let origin = '-';
    let host = '-';
    let keyType = '-';

    const activeConfigs = getActiveConfigs();
    const match = activeConfigs.find(
      (c: GSConfigItem) => c.username === name && c.useremail === email
    );
    if (match) {
      origin = match.origin;
      host = match.host;
      keyType = match.keyType;
    }

    console.log(chalk.cyan(`\n当前 ${scope} 配置:\n`));
    console.log(
      chalk.white('  scope  | origin | username | useremail | host | keyType')
    );
    console.log(chalk.gray('  ' + '-'.repeat(70)));
    console.log(
      `  ${scope.padEnd(7)} | ${origin.padEnd(6)} | ${name.padEnd(8)} | ${email.padEnd(9)} | ${host.padEnd(4)} | ${keyType}`
    );
    console.log();
  } catch {
    console.log(`暂无 ${scope} 的 git 配置`);
  }
}
