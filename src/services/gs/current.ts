import Table from 'cli-table3';
import { spawn } from '../../utils/exec';
import pc from 'picocolors';
import { getActiveConfigs, GSConfigItem } from '../../utils/gs-config';
import { hasGitRepo } from '../../utils/git';

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

    const table = new Table({
      head: ['scope', 'origin', 'username', 'useremail', 'host', 'keyType'],
      style: { head: ['cyan', 'bold'], border: ['gray'] },
    });
    table.push([scope, origin, name, email, host, keyType]);

    console.log(pc.bold(pc.cyan(`\n当前 ${scope} 配置:\n`)));
    console.log(table.toString());
  } catch {
    console.log(pc.yellow(`暂无 ${scope} 的 git 配置`));
  }
}
