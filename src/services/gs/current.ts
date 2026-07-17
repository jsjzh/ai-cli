import { spawn } from '../../utils/exec.js';
import chalk from 'chalk';
import { getActiveConfigs, GSConfigItem } from '../../utils/gs-config.js';
import { hasGitRepo } from '../../utils/git.js';

export default async function current() {
  const scope = hasGitRepo() ? 'local' : 'global';
  const scopeFlag = hasGitRepo() ? '--local' : '--global';

  try {
    const name = spawn('git', ['config', scopeFlag, 'user.name'], {
      encoding: 'utf8',
    }).trim();
    const email = spawn('git', ['config', scopeFlag, 'user.email'], {
      encoding: 'utf8',
    }).trim();

    let origin = '-';
    let host = '-';
    let keyType = '-';

    const activeConfigs = getActiveConfigs();
    const match = activeConfigs.find(
      (c: GSConfigItem) => c.username === name && c.useremail === email,
    );
    if (match) {
      origin = match.origin;
      host = match.host;
      keyType = match.keyType;
    }

    const pad = (s: string, n: number) => s.padEnd(Math.max(s.length + 2, n));

    console.log(chalk.cyan(`\n当前 ${scope} 配置:\n`));
    console.log(
      chalk.white(
        `  ${pad('scope', 8)}${pad('origin', 8)}${pad('username', 10)}${pad('useremail', 12)}host  keyType`,
      ),
    );
    const line = `  ${pad(scope, 8)}${pad(origin, 8)}${pad(name, 10)}${pad(email, 12)}${pad(host, 6)}${keyType}`;
    console.log(chalk.gray('  ' + '-'.repeat(line.length - 2)));
    console.log(line);
    console.log();
  } catch {
    console.log(`暂无 ${scope} 的 git 配置`);
  }
}
