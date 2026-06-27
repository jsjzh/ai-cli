import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import chalk from 'chalk';

const SSH_DIR = path.join(homedir(), '.ssh');
const GS_CONFIG_PATH = path.join(SSH_DIR, 'gs-config.json');

export default async function current() {
  const hasGit = existsSync(path.join(process.cwd(), '.git'));
  const scope = hasGit ? 'local' : 'global';
  const scopeFlag = hasGit ? '--local' : '--global';

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

    if (existsSync(GS_CONFIG_PATH)) {
      const configs = JSON.parse(readFileSync(GS_CONFIG_PATH, 'utf8'));
      const activeConfigs = configs.filter((c: any) => !c.deleteTime);
      const match = activeConfigs.find(
        (c: any) => c.username === name && c.useremail === email
      );
      if (match) {
        origin = match.origin;
        host = match.host;
        keyType = match.keyType;
      }
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
